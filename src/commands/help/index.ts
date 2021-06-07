/*
 * This is the help command and all related functionality.
 */

import { Command } from "../../command";
import { Message } from "discord.js";
import { COMMAND_LIST } from "..";

export const HELP_PREDICATE = "help";

export const HELP_DESCRIPTION =
  "Lists the current bot commands available and their purpose.";

const args = []; // The arguments which are valid for the given command.

// Gets the commands without any arguments.
const GetDefaultCommands = (msg: Message) => {
  msg.channel.send(
    "```" +
      Object.values(COMMAND_LIST)
        .map((value, idx) => `${Object.keys(COMMAND_LIST)[idx]} - ${value}`)

        .join("\n") +
      "```"
  );
};

export const Help = (msg: Message, command: Command) => {
  if (command.args.length === 0) GetDefaultCommands(msg);
};
