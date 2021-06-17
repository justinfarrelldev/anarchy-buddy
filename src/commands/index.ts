// Module map to show predicates and execute them if they are encountered

import { Message } from "discord.js";
import { Create, CREATE_DESCRIPTION, CREATE_PREDICATE } from "./create";
import { Help, HELP_DESCRIPTION, HELP_PREDICATE } from "./help";
import { List, LIST_DESCRIPTION, LIST_PREDICATE } from "./list";

export const COMMAND_LIST = {
  [HELP_PREDICATE]: HELP_DESCRIPTION,
  [CREATE_PREDICATE]: CREATE_DESCRIPTION,
  [LIST_PREDICATE]: LIST_DESCRIPTION,
};

/*
 * ResolveCommand resolves a command and executes the correct action for it.
 * @param predicate The predicate of the command.
 * @param args The rest of the arguments after the command.
 * Returns true if a command was found, else false.
 */
export const ResolveCommand = async (msg: Message) => {
  const messageTokens = msg.content.split(" ");
  let command = {
    predicate: messageTokens[1],
    args: messageTokens.filter((_: any, idx: number) => idx > 1),
  };
  let result: boolean = false;
  switch (messageTokens[1]) {
    case HELP_PREDICATE:
      result = Help(msg, command);
    case CREATE_PREDICATE:
      result = await Create(msg, command);
    case LIST_PREDICATE:
      result = List(msg, command);
  }

  return result == false ? false : true;
};
