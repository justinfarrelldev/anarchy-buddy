import { Message } from "discord.js";

// The name to use for accessing the bot commands.
export const BOT_COMMAND_NAME = "ab";

interface ERRORS_INTERFACE {
  INVALID_COMMAND: string;
}

export const ERRORS: ERRORS_INTERFACE = {
  INVALID_COMMAND: "Invalid command.",
};

export const Error = (msg: Message, err: keyof ERRORS_INTERFACE) => {
  console.error(
    `Error by ${msg.author.username}: ${err} for message "${msg.content}"`
  );
  msg.channel.send(ERRORS[err]);
};
