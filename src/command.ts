import { Message } from "discord.js";
import { BOT_COMMAND_NAME } from "./constants";

/*
 * This is the Command type itself which all subcommands derive from.
 * @param predicate The word which initializes the command.
 * @param args The remaining arguments supplied to the command.
 */
export interface Command {
  predicate: string;
  args: string[];
}

export const IsCommand = (msg: Message | string) => {
  // ! If anyone knows how to do this weird thing, that would be much appreciated!
  // @ts-ignore
  const tokens = msg.content ? msg.content.split(" ") : msg.split(" ");
  if (tokens[0] == BOT_COMMAND_NAME) return true;
  return false;
};
