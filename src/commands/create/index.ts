/*
 * This is the create command and all related functionality.
 */

import { Command } from "../../command";
import { Message } from "discord.js";
import {
  BOT_COMMAND_WAIT_TIME_MS,
  BOT_TEAM_DATABASE_NAME,
  ERRORS,
  unknownCommandError,
} from "../../constants";
import { docClient } from "../../index";
import { DocumentClient } from "aws-sdk/clients/dynamodb";

export const CREATE_PREDICATE = "create";
export const CREATE_DESCRIPTION = `Can be used to create groups. Example: "ab create 'group name'"`;
export const CREATE_USAGE = "create [group]";

const makeGroup = async (msg: Message, groupName?: string) => {
  let description,
    members = [],
    color;
  if (!groupName) {
    msg.channel.send("Please specify the name for the group.");
    await msg.channel
      .awaitMessages((m) => m.author.id == msg.author.id, {
        max: 1,
        time: BOT_COMMAND_WAIT_TIME_MS,
      })
      .then((collected) => {
        groupName = collected.first().content;
      })
      .catch((err) => console.error(err));

    msg.channel.send("Please write a description for the group.");
    await msg.channel
      .awaitMessages((m) => m.author.id == msg.author.id, {
        max: 1,
        time: BOT_COMMAND_WAIT_TIME_MS,
      })
      .then((collected) => {
        description = collected.first().content;
      });

    msg.channel.send("Please @mention the members of the group.");
    await msg.channel
      .awaitMessages((m) => m.author.id == msg.author.id, {
        max: 1,
        time: BOT_COMMAND_WAIT_TIME_MS,
      })
      .then((collected) => {
        collected
          .first()
          .mentions.users.forEach((member) =>
            members.push(`${member.username}#${member.discriminator}`)
          );
        console.log("Collected: ", members);
      });
  } else {
    console.log("Would do the other stuff");
  }

  const params: DocumentClient.PutItemInput = {
    TableName: BOT_TEAM_DATABASE_NAME,
    Item: {
      id: Date.now(),
      info: {
        name: groupName,
        description: description,
        members: members,
      },
    },
  };

  docClient.put(params, (error) => {
    if (!error) {
      return msg.channel.send(`Successfully created ${groupName}.`);
    } else {
      return console.error(`${ERRORS.DB_ERROR}: ${error}`);
    }
  });
};

export const Create = (msg: Message, command: Command) => {
  if (command.args.length === 0) {
    unknownCommandError(msg, CREATE_USAGE);
    return;
  }

  switch (command.args[0].toLowerCase()) {
    case "group":
      makeGroup(msg, command.args.length > 1 ? command.args[1] : undefined);
  }
};
