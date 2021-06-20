import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { Collection, Message, User } from "discord.js";
import { docClient } from "../..";
import { Command } from "../../command";
import {
  BOT_TEAM_DATABASE_NAME,
  ERRORS,
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
    ProjectionExpression: "info.members",
  };

  const membersList = await docClient
    .scan(params, (error) => {
      if (error) {
        return console.error(`${ERRORS.DB_UPDATE_ERROR}: ${error}`);
      }
    })
    .promise()
    .then((result) => {
      return result.Items.map((item) => item["info"]["members"]);
    });

  // ! Do not change the order in which these are listed, as this is important for handling the deletion of the right member.

  const indicesToDelete = membersList[0]
    .map((member, idx) => {
      let contained = false;
      users.forEach((user) => {
        if (member === `${user.username}#${user.discriminator}`) {
          contained = true;
        }
      });
      if (contained) return idx;
    })
    .filter((idx) => idx != undefined);

  const stringUpdate = indicesToDelete
    .map((idx) => `info.members[${idx}]`)
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
};

export const Remove = (msg: Message, command: Command): boolean => {
  if (!command.args[0]) {
    unknownCommandError(msg, REMOVE_USAGE);
    return false;
  }

  attemptRemove(msg, msg.mentions.users, command.args[command.args.length - 1]);

  // Command logic goes here
  return true; // True if the command passed, if it failed then false
};
