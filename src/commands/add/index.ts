import { Message } from "discord.js";
import { Command } from "../../command";

export const ADD_PREDICATE = "add";
export const ADD_DESCRIPTION = `Add a person to something.`;
export const ADD_USAGE = "add [@user] to [group name]";

export const Add = (msg: Message, command: Command): boolean => {
  // Command logic goes here
  return true; // True if the command passed, if it failed then false
};
