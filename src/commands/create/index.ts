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

const makePublicGroup = async (
  msg: Message,
  group: Group,
  groupName?: string
) => {
  let members = [];
  if (!groupName) {
    msg.channel.send("Please specify the name for the group.");
    group.owner = `${msg.author.username}#${msg.author.discriminator}`;
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
      group.description = collected.first().content;
    })
    .catch((err) => console.error(err));

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
        group.members = members.join(",");
      })
      .catch((err) => console.error(err));
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
        group.color = collected.first().content;
      } else if (collected.first().content != "")
        group.color = stringToColor(collected.first().content);
    })
    .catch((err) => console.error(err));

  const params: DocumentClient.PutItemInput = {
    TableName: BOT_TEAM_DATABASE_NAME,
    Item: {
      id: Date.now(),
      info: group,
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

const makePrivateGroup = async (
  msg: Message,
  group: Group,
  groupName?: string
) => {
  let members = [];

  msg.author
    .send(
      `Got it! Your secret is safe with me! What would you like to call this group?`
    )
    .then(async (dmMsg) => {
      console.log(`DM MESSAGE MADE, AUTHOR: ${msg.author.username}`);
      await dmMsg.channel
        .awaitMessages((m) => m.author.id == msg.author.id, {
          max: 1,
          time: BOT_COMMAND_WAIT_TIME_MS,
        })
        .then((collected) => {
          console.log(
            "Got the message: ",
            collected.map((response) => `${response}`)
          );
        })
        .catch((err) => console.error(err));
    });
};

const makeGroup = async (msg: Message, groupName?: string) => {
  const group: Group = {
    description: "",
    members: "",
    color: "",
    owner: "",
    privateGroup: false,
    name: "",
    server: "",
  };

  msg.channel.send(
    "Will this group be private? (Will DM you asking the details there for some privacy 😉) [yes/no]"
  );
  await msg.channel
    .awaitMessages((m) => m.author.id == msg.author.id, {
      max: 1,
      time: BOT_COMMAND_WAIT_TIME_MS,
    })
    .then((collected) => {
      group.privateGroup =
        collected.first().content.toLowerCase() == "yes"
          ? (group.privateGroup = true)
          : (group.privateGroup = false);
    })
    .catch((err) => console.error(err));

  if (!group.privateGroup) {
    makePublicGroup(msg, group, groupName);
  } else {
    makePrivateGroup(msg, group, groupName);
  }
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
