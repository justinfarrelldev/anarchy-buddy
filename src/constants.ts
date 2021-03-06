import { EmbedFieldData, Message } from "discord.js";
import discord = require("discord.js");
// The name to use for accessing the bot commands.
export const BOT_COMMAND_NAME = "ab";
export const BOT_TEAM_DATABASE_NAME = "anarchy-buddy-groups";
export const BOT_COMMAND_WAIT_TIME_MS = 60000; // 1 min
export const BOT_COMMAND_WAIT_TIME_MS_PRIVATE = 300000; // 5 mins

interface ERRORS_INTERFACE {
  // Command errors
  INVALID_COMMAND: string;
  COMMAND_IN_PROGRESS: string;
  USER_ALREADY_ADDED: string;
  USER_NOT_IN_GROUP: string;
  GROUP_CREATION_TIMEOUT: string;
  LAST_ARGUMENT_NOT_TABLE_NAME: string;

  // Database errors
  DB_PUT_ERROR: string;
  DB_UPDATE_ERROR: string;
}

export const ERRORS: ERRORS_INTERFACE = {
  INVALID_COMMAND: "Invalid command. ",
  DB_PUT_ERROR: "A database put error occurred. ",
  DB_UPDATE_ERROR: "A database update error occurred. ",
  GROUP_CREATION_TIMEOUT: "Timed out. Group info discarded. ",
  COMMAND_IN_PROGRESS: "A command is already in progress. ",
  USER_ALREADY_ADDED: "A user was already added to the group: ", // ? Meant to be used in conjunction with outputting the user name
  USER_NOT_IN_GROUP:
    "A user is not part of the group and thus cannot be removed: ",
  LAST_ARGUMENT_NOT_TABLE_NAME:
    "Invalid command. The last argument must be the name of the group to affect. ",
};

export const LogUserError = (msg: Message, err: keyof ERRORS_INTERFACE) => {
  console.log(
    `Error by ${msg.author.username}: ${err} for message "${msg.content}"`
  );
};

export let HELP_EMBED = new discord.MessageEmbed()
  .setColor("#0099ff")
  .setTitle("Help");

/*
 * sendHelpMessageToChannel
 * @param msg The Discord message to communicate with the channel.
 * @param data The data to be supplied to the HELP_EMBED.
 */
export const sendHelpMessageToChannel = (
  msg: Message,
  data: EmbedFieldData[] | EmbedFieldData[][]
) => {
  msg.channel.send(HELP_EMBED.addFields(...data));
  HELP_EMBED.fields = [];
};

/*
 * unknownCommandError
 * @param msg The Discord message to communicate with the channel.
 * @param usage Extra information to be displayed. Required on purpose.
 */
export const unknownCommandError = (msg: Message, usage: string) => {
  LogUserError(msg, "INVALID_COMMAND");
  msg.channel.send(`${ERRORS.INVALID_COMMAND} Usage: ${usage}`);
};
