import { Message } from "discord.js";
import { Command } from "../../command";

/*
    ! You may want to add the module to the command list below 
    LINK src/commands/index.ts#command_list_anchor
*/

export const Add = (msg: Message, command: Command): boolean => {
  // Command logic goes here
  return true; // True if the command passed, if it failed then false
};
