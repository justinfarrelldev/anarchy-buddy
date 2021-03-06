/*
 * This is the create command and all related functionality.
 */

import { Command, IsCommand } from "../../command";
import { Collection, Message, Role } from "discord.js";
import {
  BOT_COMMAND_WAIT_TIME_MS,
  BOT_COMMAND_WAIT_TIME_MS_PRIVATE,
  BOT_TEAM_DATABASE_NAME,
  ERRORS,
  unknownCommandError,
} from "../../constants";
import discordClient, { docClient, userList } from "../../index";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { Group } from "./group";
import {
  CleanUpAfterCommand,
  GenerateChannelNameForGroup,
  InitializeCommand,
} from "..";
const stringToColor = require("string-to-color");

export const CREATE_PREDICATE = "create";
export const CREATE_DESCRIPTION = `Can be used to create groups. Example: "ab create 'group name'"`;
export const CREATE_USAGE = "create [group]";

const createPrivateChannels = async (msg: Message, groupToUpload: Group) => {
  let roleCreated: Role;
  await msg.guild.roles
    .create({
      data: {
        name: groupToUpload.name,
        color: groupToUpload.color,
      },
      reason: "Automatically created by Anarchy Buddy during group creation.",
    })
    .then((role) => {
      roleCreated = role;
    })
    .catch(console.error);

  groupToUpload.guildMembers.forEach((member) => {
    let memberNew = msg.guild.member(member);
    memberNew.roles.add(roleCreated);
  });

  groupToUpload.role = roleCreated;

  msg.guild.channels
    .create(`${groupToUpload.name}`, {
      reason: "Automatically created by Anarchy Buddy during group creation.",
      type: "category",
    })
    .then((cat) => {
      cat.overwritePermissions([
        { id: msg.guild.roles.everyone.id, deny: ["VIEW_CHANNEL"] },
      ]); // Deny viewing for @everyone
      cat.overwritePermissions([
        { id: discordClient.user.id, allow: ["VIEW_CHANNEL"] },
      ]); // Allow the bot to view the channel
      //groupToUpload.guildMembers.forEach((member) => {
      cat.overwritePermissions([
        { id: roleCreated.id, allow: ["VIEW_CHANNEL"] },
      ]); // Allow viewing for those in the group
      //});
      msg.guild.channels
        .create(GenerateChannelNameForGroup(groupToUpload.name), {
          reason:
            "Automatically created by Anarchy Buddy during group creation.",
          type: "text",
          parent: cat,
          permissionOverwrites: [
            { id: msg.guild.roles.everyone.id, deny: ["VIEW_CHANNEL"] },
            { id: roleCreated.id, allow: ["VIEW_CHANNEL"] },
          ],
        })
        .catch(console.error);
      msg.guild.channels
        .create(`${GenerateChannelNameForGroup(groupToUpload.name)}-Voice`, {
          reason:
            "Automatically created by Anarchy Buddy during group creation.",
          type: "voice",
          parent: cat,
          permissionOverwrites: [
            { id: msg.guild.roles.everyone.id, deny: ["VIEW_CHANNEL"] },
            { id: roleCreated.id, allow: ["VIEW_CHANNEL"] },
          ],
        })
        .catch(console.error);
    })
    .catch(console.error);
};

const uploadGroup = async (
  msg: Message,
  groupToUpload: Group,
  privateGroup: boolean
) => {
  CleanUpAfterCommand(msg, CREATE_PREDICATE);
  const params: DocumentClient.PutItemInput = {
    TableName: BOT_TEAM_DATABASE_NAME,
    Item: {
      id: `${groupToUpload.name}-${msg.guild.id}`,
      info: groupToUpload,
    },
  };

  docClient.put(params, (error) => {
    if (!error) {
      return !privateGroup
        ? msg.channel.send(`Successfully created ${groupToUpload.name}.`)
        : msg.author.send(`Successfully created ${groupToUpload.name}.`);
    } else {
      return console.error(`${ERRORS.DB_PUT_ERROR}: ${error}`);
    }
  });
};

const checkCollected = (collected: Collection<string, Message>, msg: Message) =>
  !userList.UserInListExceptPredicate(
    {
      username: msg.author.username,
      discriminator: msg.author.discriminator,
    },
    CREATE_PREDICATE
  ) && !IsCommand(collected.first())
    ? true
    : false;

const takeInput = async (
  msg: Message,
  messageToDisplay: string,
  group: Group,
  waitTimeInMillis: number,
  onFulfilled: (input: Collection<string, Message>) => void | PromiseLike<void>,
  privateGroup?: boolean,
  dmMsg?: Message
): Promise<{ timeout: boolean; group?: Group }> => {
  let fulfilled = false;
  while (!fulfilled) {
    if (!privateGroup) {
      msg.channel.send(messageToDisplay);
      await msg.channel
        .awaitMessages((m) => m.author.id == msg.author.id, {
          max: 1,
          time: waitTimeInMillis,
        })
        .then((collected) => {
          if (checkCollected(collected, msg)) {
            fulfilled = true;
            onFulfilled(collected);
          }
        })
        .catch((err) => console.error(err));
    } else {
      msg.author.send(messageToDisplay);
      await dmMsg.channel
        .awaitMessages((m) => m.author.id == msg.author.id, {
          max: 1,
          time: waitTimeInMillis,
        })
        .then((collected) => {
          if (checkCollected(collected, msg)) {
            fulfilled = true;
            onFulfilled(collected);
          }
        })
        .catch((err) => console.error(err));
    }
  }

  return { timeout: false, group };
};

const makePublicGroup = async (
  msg: Message,
  group: Group,
  groupName?: string
) => {
  let members = [];
  let timeout = false;
  let newChannels = false;
  if (!groupName) {
    group.owner = `${msg.author.username}#${msg.author.discriminator}`;
    await takeInput(
      msg,
      "Please specify the name for the group.",
      group,
      BOT_COMMAND_WAIT_TIME_MS,
      (collected) => {
        if (!collected.first()) {
          timeout = true;
          return;
        }
        group.name = collected.first().content;
      }
    );
  }

  if (timeout) {
    msg.channel.send(ERRORS.GROUP_CREATION_TIMEOUT);
    return;
  }

  await takeInput(
    msg,
    `Add a description for ${group.name}.`,
    group,
    BOT_COMMAND_WAIT_TIME_MS,
    (collected) => {
      if (!collected.first()) {
        timeout = true;
        return;
      }
      group.description = collected.first().content;
    }
  );

  if (timeout) {
    msg.channel.send(ERRORS.GROUP_CREATION_TIMEOUT);
    return;
  }

  await takeInput(
    msg,
    `Would you like to add private chats for ${group.name}? (yes or no)`,
    group,
    BOT_COMMAND_WAIT_TIME_MS,
    (collected) => {
      if (!collected.first()) {
        timeout = true;
        return;
      }

      newChannels =
        collected.first().content.toLowerCase() == "yes" ? true : false;
    }
  );

  if (timeout) {
    msg.channel.send(ERRORS.GROUP_CREATION_TIMEOUT);
    return;
  }

  while (members.length == 0 && !timeout) {
    if (timeout) return;

    await takeInput(
      msg,
      "Please @mention the members of the group.",
      group,
      BOT_COMMAND_WAIT_TIME_MS,
      (collected) => {
        if (!collected.first()) {
          timeout = true;
          return;
        }

        collected
          .first()
          .mentions.users.forEach((member) => members.push(member));
        group.guildMembers = members;
      }
    );
  }

  if (timeout) {
    msg.channel.send(ERRORS.GROUP_CREATION_TIMEOUT);
    return;
  }

  await takeInput(
    msg,
    "Add a custom color (optional).",
    group,
    BOT_COMMAND_WAIT_TIME_MS,
    (collected) => {
      if (!collected.first()) {
        timeout = true;
        return;
      }

      // Regex for hex colors
      if (/^#[0-9A-F]{6}$/i.test(collected.first().content)) {
        group.color = collected.first().content;
      } else if (collected.first().content != "")
        group.color = stringToColor(collected.first().content);
    }
  );

  if (timeout) {
    msg.channel.send(ERRORS.GROUP_CREATION_TIMEOUT);
    return;
  }

  if (newChannels) createPrivateChannels(msg, group);

  uploadGroup(msg, group, false);
};

const makePrivateGroup = async (
  msg: Message,
  group: Group,
  groupName?: string
) => {
  let members = [];
  let timeout = false;

  let dmMsg: Message = await msg.author.send(
    `Got it! Your secret is safe with me!`
  );

  if (!groupName) {
    group.owner = `${msg.author.username}#${msg.author.discriminator}`;
    await takeInput(
      msg,
      "What would you like to call this group?",
      group,
      BOT_COMMAND_WAIT_TIME_MS,
      (collected) => {
        if (!collected.first()) {
          timeout = true;
          return;
        }

        group.name = collected.first().content;
      },
      true,
      dmMsg
    );
  }

  if (timeout) {
    msg.channel.send(ERRORS.GROUP_CREATION_TIMEOUT);
    return;
  }

  await takeInput(
    msg,
    `Add a description for ${group.name}.`,
    group,
    BOT_COMMAND_WAIT_TIME_MS,
    (collected) => {
      if (!collected.first()) {
        timeout = true;
        return;
      }

      group.description = collected.first().content;
    },
    true,
    dmMsg
  );

  if (timeout) {
    dmMsg.channel.send(ERRORS.GROUP_CREATION_TIMEOUT);
    return;
  }
  while (members.length == 0 && !timeout) {
    await takeInput(
      msg,
      `Please @mention the members of the group inside the bot channel within ${
        BOT_COMMAND_WAIT_TIME_MS_PRIVATE / (1000 * 60)
      } minutes. You can use spoiler text if you wish by surrounding the text with pipes like so: ll @ThisIsHidden ll. The message will be automatically deleted.`,
      group,
      BOT_COMMAND_WAIT_TIME_MS,
      (collected) => {
        if (!collected.first()) {
          timeout = true;
          return;
        }

        collected
          .first()
          .mentions.users.forEach((member) => members.push(member));

        group.guildMembers = members;
        msg.channel.lastMessage.delete({
          reason: "Getting rid of a member list for a private group.",
        });
      },
      true,
      msg // ! ON PURPOSE to allow for listening to the main channel
    );
  }

  if (timeout) {
    msg.channel.send(ERRORS.GROUP_CREATION_TIMEOUT);
    return;
  }

  await takeInput(
    msg,
    "Add a custom color (optional).",
    group,
    BOT_COMMAND_WAIT_TIME_MS,
    (collected) => {
      if (!collected.first()) {
        timeout = true;
        return;
      }

      // Regex for hex colors
      if (/^#[0-9A-F]{6}$/i.test(collected.first().content)) {
        group.color = collected.first().content;
      } else if (collected.first().content != "")
        group.color = stringToColor(collected.first().content);
    },
    true,
    dmMsg
  );

  if (timeout) {
    msg.channel.send(ERRORS.GROUP_CREATION_TIMEOUT);
    return;
  }
  uploadGroup(msg, group, true);
};

const makeGroup = async (msg: Message, groupName?: string) => {
  const group: Group = {
    description: "",
    guildMembers: [],
    color: "",
    owner: "",
    privateGroup: false,
    name: groupName ? groupName : "",
    server: msg.guild.id,
    role: undefined,
  };

  await takeInput(
    msg,
    "Will this group be private? (Will DM you asking the details there for some privacy ????) [yes/no]",
    group,
    BOT_COMMAND_WAIT_TIME_MS,
    (collected) => {
      if (!collected.first()) {
        msg.channel.send(ERRORS.GROUP_CREATION_TIMEOUT);
        return;
      }

      group.privateGroup =
        collected.first().content.toLowerCase() == "yes"
          ? (group.privateGroup = true)
          : (group.privateGroup = false);
    }
  );

  if (!group.privateGroup) {
    makePublicGroup(msg, group, groupName);
  } else {
    makePrivateGroup(msg, group, groupName);
  }
};

export const Create = async (msg: Message, command: Command) => {
  if (command.args.length === 0) {
    unknownCommandError(msg, CREATE_USAGE);
    return false;
  }

  switch (command.args[0].toLowerCase()) {
    case "group":
      InitializeCommand(msg, CREATE_PREDICATE);
      makeGroup(msg, command.args.length > 1 ? command.args[1] : undefined);
      return true;
  }

  CleanUpAfterCommand(msg, CREATE_PREDICATE);
  return false;
};
