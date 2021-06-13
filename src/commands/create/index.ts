/*
 * This is the create command and all related functionality.
 */

import { Command } from "../../command";
import { Message } from "discord.js";
import {
  BOT_TEAM_DATABASE_NAME,
  ERRORS,
  unknownCommandError,
} from "../../constants";
import { docClient } from "../../index";
import { DocumentClient } from "aws-sdk/clients/dynamodb";

export const CREATE_PREDICATE = "create";
export const CREATE_DESCRIPTION = `Can be used to create teams. Example: "ab create 'team name'"`;
export const CREATE_USAGE = "create [team]";

const makeTeam = (msg: Message, teamName?: string) => {
  const params: DocumentClient.PutItemInput = {
    TableName: BOT_TEAM_DATABASE_NAME,
    Item: {
      id: Date.now(),
      info: {
        name: teamName,
        description: "Just a dynamo db test",
      },
    },
  };

  docClient.put(params, (error) => {
    if (!error) {
      return msg.channel.send(`Successfully created ${teamName}.`);
    } else {
      return console.error(ERRORS.DB_ERROR);
    }
  });
};

export const Create = (msg: Message, command: Command) => {
  if (command.args.length === 0) {
    unknownCommandError(msg, CREATE_USAGE);
    return;
  }

  switch (command.args[0].toLowerCase()) {
    case "team":
      makeTeam(msg, command.args.length > 1 ? command.args[1] : undefined);
  }
};
