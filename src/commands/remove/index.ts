import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { Collection, Message, User } from "discord.js";
import { GetInfoFromGroup, TokenIsMention } from "..";
import { docClient } from "../..";
import { Command } from "../../command";
import {
  BOT_TEAM_DATABASE_NAME,
  ERRORS,
  LogUserError,
  unknownCommandError,
} from "../../constants";

export const REMOVE_PREDICATE = "remove";
export const REMOVE_DESCRIPTION = `Removes a person from something.`;
export const REMOVE_USAGE = "remove [...@user] [group name]";

const attemptRemove = async (
  msg: Message,
  users: Collection<string, User>,
  groupName: string
) => {
  const params: DocumentClient.ScanInput = {
    TableName: BOT_TEAM_DATABASE_NAME,
    ProjectionExpression: "info.guildMembers",
    FilterExpression: `contains(id,:idValue)`,
    ExpressionAttributeValues: {
      ":idValue": `${groupName}-${msg.guild.id}`,
    },
  };

  const info = await GetInfoFromGroup(params);
  console.log("INFO: ", info);
  if (info === undefined) {
    console.error(
      `The group that was attempted removal on doesn't exist (group name: ${groupName}, attempted removal by ${msg.author.username}#${msg.author.discriminator})`
    );
    msg.channel.send("Group not found (case-sensitive).");
    return;
  }
  const membersList = info["guildMembers"];

  let nonContained = [];
  users = users.filter((user) => {
    let contained = false;
    membersList.forEach((member) => {
      console.log(
        "user: ",
        `${user.username}#${user.discriminator}`,
        " == ",
        `${member.username}#${member.discriminator}`,
        " then contained"
      );
      if (
        `${user.username}#${user.discriminator}` ==
        `${member.username}#${member.discriminator}`
      ) {
        contained = true;
      }
    });
    if (!contained) nonContained.push(user);
    return contained;
  });

  // ! Do not change the order in which these are listed, as this is important for handling the deletion of the right member.

  const indicesToDelete = membersList
    .map((member, idx) => {
      let contained = false;
      users.forEach((user) => {
        if (
          `${member.username}#${member.discriminator}` ===
          `${user.username}#${user.discriminator}`
        ) {
          contained = true;
        }
      });
      if (contained) return idx;
    })
    .filter((idx) => idx != undefined);

  const stringUpdate = indicesToDelete
    .map((idx) => `info.guildMembers[${idx}]`)
    .join(", ");

  const paramsUpdate: DocumentClient.UpdateItemInput = {
    TableName: BOT_TEAM_DATABASE_NAME,
    Key: {
      id: `${groupName}-${msg.guild.id}`,
    },
    UpdateExpression: `REMOVE ${stringUpdate}`,
  };

  docClient.update(paramsUpdate, (error) => {
    if (!error) {
      return msg.channel.send(
        `Removed ${users
          .map((user) => user.username)
          .join(", ")} from the group ${groupName}.`
      );
    } else {
      return console.error(`${ERRORS.DB_UPDATE_ERROR}: ${error}`);
    }
  });

  // Must now remove from role if it exists on the user

  users.forEach((user) => {
    let member = msg.guild.member(user);
    member.roles.remove(info["role"]);
  });
};

export const Remove = (msg: Message, command: Command): boolean => {
  if (!command.args[0]) {
    unknownCommandError(msg, REMOVE_USAGE);
    return false;
  }

  if (TokenIsMention(command.args[command.args.length - 1])) {
    LogUserError(msg, "LAST_ARGUMENT_NOT_TABLE_NAME");
    msg.channel.send(`${ERRORS.LAST_ARGUMENT_NOT_TABLE_NAME}`);
    return;
  }

  const [_drop, ...args] = command.args;
  attemptRemove(msg, msg.mentions.users, args.join(" "));

  // Command logic goes here
  return true; // True if the command passed, if it failed then false
};
