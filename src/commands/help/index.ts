/*
 * This is the help command and all related functionality.
 */

import { Command } from "../../command";
import { Message, EmbedFieldData } from "discord.js";
import { COMMAND_LIST } from "..";
import { HELP_EMBED } from "../../constants";

export const HELP_PREDICATE = "help";
export const HELP_DESCRIPTION =
  "Lists the current bot commands available and their purpose.";

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
};

export const Help = (msg: Message, command: Command) => {
  if (command.args.length === 0) GetDefaultCommands(msg);
};
