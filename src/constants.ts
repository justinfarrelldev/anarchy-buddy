import { EmbedFieldData, Message } from "discord.js";
import discord = require("discord.js");
// The name to use for accessing the bot commands.
export const BOT_COMMAND_NAME = "ab";
export const BOT_TEAM_DATABASE_NAME = "anarchy-buddy-teams";
export const BOT_COMMAND_WAIT_TIME_MS = 60000; // 1 min
export const BOT_COMMAND_WAIT_TIME_MS_PRIVATE = 300000; // 5 mins

interface ERRORS_INTERFACE {
  INVALID_COMMAND: string;
  DB_ERROR: string;
  GROUP_CREATION_TIMEOUT: string;
  COMMAND_IN_PROGRESS: string;
}

export const ERRORS: ERRORS_INTERFACE = {
  INVALID_COMMAND: "Invalid command.",
  DB_ERROR: "A database error occurred.",
  GROUP_CREATION_TIMEOUT: "Timed out. Group info discarded.",
  COMMAND_IN_PROGRESS: "A command is already in progress.",
};

export const LogUserError = (msg: Message, err: keyof ERRORS_INTERFACE) => {
  console.error(
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
