/*
 * This is the help command and all related functionality.
 */

import { Command } from "../../command";
import { Message, EmbedFieldData } from "discord.js";
import { COMMAND_LIST } from "..";
import { HELP_EMBED } from "../../constants";
import { userList } from "../..";

export const HELP_PREDICATE = "help";
export const HELP_DESCRIPTION =
  "Lists the current bot commands available and their purpose.";
export const HELP_USAGE = "help <command name>";

// Gets the commands without any arguments.
const GetDefaultCommands = (msg: Message) => {
  msg.channel.send(
    HELP_EMBED.addFields(
      Object.values(COMMAND_LIST).map((value, idx) => {
        return {
          name: Object.keys(COMMAND_LIST)[idx],
          value: value,
        } as EmbedFieldData;
      })
    )
  );
  HELP_EMBED.fields = [];
};

export const Help = (msg: Message, command: Command) => {
  if (command.args.length === 0) {
    GetDefaultCommands(msg);
    return true;
  }

  for (const field in COMMAND_LIST) {
    if (field === command.args[0]) {
      msg.channel.send(
        HELP_EMBED.addFields({
          name: field,
          value: COMMAND_LIST[field],
        })
      );
      HELP_EMBED.fields = [];
    }
  }
  return true;
};
