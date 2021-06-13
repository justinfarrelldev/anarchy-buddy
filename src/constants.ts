import { EmbedFieldData, Message } from "discord.js";
import discord = require("discord.js");
// The name to use for accessing the bot commands.
export const BOT_COMMAND_NAME = "ab";

interface ERRORS_INTERFACE {
  INVALID_COMMAND: string;
  DB_ERROR: string;
}

export const ERRORS: ERRORS_INTERFACE = {
  INVALID_COMMAND: "Invalid command.",
  DB_ERROR: "A database error occurred.",
};

export const Error = (msg: Message, err: keyof ERRORS_INTERFACE) => {
  console.error(
    `Error by ${msg.author.username}: ${err} for message "${msg.content}"`
  );
  msg.channel.send(ERRORS[err]);
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
  msg.channel.send(`${ERRORS.INVALID_COMMAND} Usage: ${usage}`);
};
