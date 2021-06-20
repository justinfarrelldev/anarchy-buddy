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

  console.log("Members list: ", membersList[0]);

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

  console.log("Would delete: ", indicesToDelete);
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
