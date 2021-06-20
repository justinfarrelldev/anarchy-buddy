import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { Collection, Message, User } from "discord.js";
import { GetMemberListFromGroup } from "..";
import { docClient } from "../..";
import { Command } from "../../command";
import {
  BOT_TEAM_DATABASE_NAME,
  ERRORS,
  unknownCommandError,
} from "../../constants";

export const ADD_PREDICATE = "add";
export const ADD_DESCRIPTION = `Add a person to something.`;
export const ADD_USAGE = "add [...@user] [group name]";

const attemptUpdate = async (
  msg: Message,
  users: Collection<string, User>,
  groupName: string
) => {
  const params: DocumentClient.ScanInput = {
    TableName: BOT_TEAM_DATABASE_NAME,
    ProjectionExpression: "info.members",
    FilterExpression: `contains(id,:idValue)`,
    ExpressionAttributeValues: {
      ":idValue": `${groupName}-${msg.guild.id}`,
    },
  };

  const currentMembers = await GetMemberListFromGroup(params);

  const paramsUpdate: DocumentClient.UpdateItemInput = {
    TableName: BOT_TEAM_DATABASE_NAME,
    Key: {
      id: `${groupName}-${msg.guild.id}`,
    },
    UpdateExpression:
      "SET info.members = list_append(info.members, :newMembers)",
    ExpressionAttributeValues: {
      ":newMembers": users.map(
        (user) => `${user.username}#${user.discriminator}`
      ),
    },
  };

  docClient.update(paramsUpdate, (error) => {
    if (!error) {
      return msg.channel.send(
        `Added ${users
          .map((user) => user.username)
          .join(", ")} to the group ${groupName}`
      );
    } else {
      return console.error(`${ERRORS.DB_UPDATE_ERROR}: ${error}`);
    }
  });
};

export const Add = (msg: Message, command: Command): boolean => {
  if (!command.args[0]) {
    unknownCommandError(msg, ADD_USAGE);
    return false;
  }

  attemptUpdate(msg, msg.mentions.users, command.args[command.args.length - 1]);

  return true; // True if the command passed, if it failed then false
};
