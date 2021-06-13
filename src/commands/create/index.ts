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
import { Group } from "./group";
const stringToColor = require("string-to-color");

export const CREATE_PREDICATE = "create";
export const CREATE_DESCRIPTION = `Can be used to create groups. Example: "ab create 'group name'"`;
export const CREATE_USAGE = "create [group]";

const makeGroup = async (msg: Message, groupName?: string) => {
  let description: string,
    members: string[] = [],
    color: string,
    owner: string;
  if (!groupName) {
    msg.channel.send("Please specify the name for the group.");
    owner = `${msg.author.username}#${msg.author.discriminator}`;
    await msg.channel
      .awaitMessages((m) => m.author.id == msg.author.id, {
        max: 1,
        time: BOT_COMMAND_WAIT_TIME_MS,
      })
      .then((collected) => {
        groupName = collected.first().content;
      })
      .catch((err) => console.error(err));
  }

  msg.channel.send(`Add a description for ${groupName}.`);
  await msg.channel
    .awaitMessages((m) => m.author.id == msg.author.id, {
      max: 1,
      time: BOT_COMMAND_WAIT_TIME_MS,
    })
    .then((collected) => {
      description = collected.first().content;
    });

  while (members.length == 0) {
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
      });
  }

  msg.channel.send("Add a custom color (optional).");
  await msg.channel
    .awaitMessages((m) => m.author.id == msg.author.id, {
      max: 1,
      time: BOT_COMMAND_WAIT_TIME_MS,
    })
    .then((collected) => {
      // Regex for hex colors
      if (/^#[0-9A-F]{6}$/i.test(collected.first().content)) {
        color = collected.first().content;
      } else if (collected.first().content != "")
        color = stringToColor(collected.first().content);
    });

  const params: DocumentClient.PutItemInput = {
    TableName: BOT_TEAM_DATABASE_NAME,
    Item: {
      id: Date.now(),
      info: {
        name: groupName,
        description: description,
        members: members.join(","),
        color: color,
        owner: owner,
        server: msg.guild.id,
      } as Group,
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

export const Create = async (msg: Message, command: Command) => {
  if (command.args.length === 0) {
    unknownCommandError(msg, CREATE_USAGE);
    return;
  }

  switch (command.args[0].toLowerCase()) {
    case "group":
      makeGroup(msg, command.args.length > 1 ? command.args[1] : undefined);
  }
};
