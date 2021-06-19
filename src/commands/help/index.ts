/*
 * This is the help command and all related functionality.
 */

import { Command } from "../../command";
import { Message, EmbedFieldData } from "discord.js";
import { CleanUpAfterCommand, COMMAND_LIST, InitializeCommand } from "..";
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
        CleanUpAfterCommand(msg, HELP_PREDICATE);
        return {
          name: Object.keys(COMMAND_LIST)[idx],
          value: value,
        } as EmbedFieldData;
      })
    )
  );
  HELP_EMBED.fields = [];
  CleanUpAfterCommand(msg, HELP_PREDICATE);
};

export const Help = (msg: Message, command: Command) => {
  InitializeCommand(msg, HELP_PREDICATE);
  if (command.args.length === 0) {
    GetDefaultCommands(msg);
    CleanUpAfterCommand(msg, HELP_PREDICATE);
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
  CleanUpAfterCommand(msg, HELP_PREDICATE);
  return false;
};
