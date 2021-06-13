/*
 * This is the create command and all related functionality.
 */

import { Command } from "../../command";
import { Message } from "discord.js";
import {
  BOT_COMMAND_WAIT_TIME_MS,
  BOT_COMMAND_WAIT_TIME_MS_PRIVATE,
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

const uploadGroup = async (
  msg: Message,
  groupToUpload: Group,
  privateGroup: boolean
) => {
  const params: DocumentClient.PutItemInput = {
    TableName: BOT_TEAM_DATABASE_NAME,
    Item: {
      id: Date.now(),
      info: groupToUpload,
    },
  };

  docClient.put(params, (error) => {
    if (!error) {
      return !privateGroup
        ? msg.channel.send(`Successfully created ${groupToUpload.name}.`)
        : msg.author.send(`Successfully created ${groupToUpload.name}.`);
    } else {
      return console.error(`${ERRORS.DB_ERROR}: ${error}`);
    }
  });
};

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
        group.name = collected.first().content;
      })
      .catch((err) => console.error(err));
  }

  msg.channel.send(`Add a description for ${group.name}.`);
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
        group.members = members;
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

  uploadGroup(msg, group, false);
};

const makePrivateGroup = async (
  msg: Message,
  group: Group,
  groupName?: string
) => {
  let members = [];

  let dmMsg: Message = await msg.author.send(
    `Got it! Your secret is safe with me!`
  );

  if (!groupName) {
    await msg.author.send("What would you like to call this group?");
    group.owner = `${msg.author.username}#${msg.author.discriminator}`;
    await dmMsg.channel
      .awaitMessages((m) => m.author.id == msg.author.id, {
        max: 1,
        time: BOT_COMMAND_WAIT_TIME_MS,
      })
      .then((collected) => {
        group.name = collected.first().content;
      })
      .catch((err) => console.error(err));
  }

  await msg.author.send(`Add a description for ${group.name}.`);
  await dmMsg.channel
    .awaitMessages((m) => m.author.id == msg.author.id, {
      max: 1,
      time: BOT_COMMAND_WAIT_TIME_MS,
    })
    .then((collected) => {
      group.description = collected.first().content;
    })
    .catch((err) => console.error(err));

  while (members.length == 0) {
    msg.author.send(
      `Please @mention the members of the group inside the bot channel within ${
        BOT_COMMAND_WAIT_TIME_MS_PRIVATE / (1000 * 60)
      } minutes. You can use spoiler text if you wish by surrounding the text with pipes like so: ll @ThisIsHidden ll. The message will be automatically deleted.`
    );
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

        group.members = members;
        msg.channel.lastMessage.delete({
          reason: "Getting rid of a member list for a private group.",
        });
      })
      .catch((err) => console.error(err));
  }

  console.log("Group members now: ", group.members);

  msg.author.send("Add a custom color (optional).");
  await dmMsg.channel
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

  uploadGroup(msg, group, true);
};

const makeGroup = async (msg: Message, groupName?: string) => {
  const group: Group = {
    description: "",
    members: [],
    color: "",
    owner: "",
    privateGroup: false,
    name: groupName ? groupName : "",
    server: msg.guild.id,
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
