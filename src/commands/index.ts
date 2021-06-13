// Module map to show predicates and execute them if they are encountered

import { Message } from "discord.js";
import { Create, CREATE_DESCRIPTION, CREATE_PREDICATE } from "./create";
import { Help, HELP_DESCRIPTION, HELP_PREDICATE } from "./help";

export const COMMAND_LIST = {
  [HELP_PREDICATE]: HELP_DESCRIPTION,
  [CREATE_PREDICATE]: CREATE_DESCRIPTION,
};

/*
 * ResolveCommand resolves a command and executes the correct action for it.
 * @param predicate The predicate of the command.
 * @param args The rest of the arguments after the command.
 * Returns true if a command was found, else false.
 */
export const ResolveCommand = (msg: Message): boolean => {
  const messageTokens = msg.content.split(" ");
  switch (messageTokens[1]) {
    case HELP_PREDICATE:
      Help(msg, {
        predicate: messageTokens[1],
        args: messageTokens.filter((_: any, idx: number) => idx > 1),
      });
      return true;
    case CREATE_PREDICATE:
      Create(msg, {
        predicate: messageTokens[1],
        args: messageTokens.filter((_: any, idx: number) => idx > 1),
      });
      return true;
  }

  return false;
};
