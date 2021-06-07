// Module map to show predicates and execute them if they are encountered

import { Command } from "../command";
import { Help, HELP_PREDICATE } from "./help";

/*
 * ResolveCommand resolves a command and executes the correct action for it.
 * @param predicate The predicate of the command.
 * @param args The rest of the arguments after the command.
 * Returns true if a command was found, else false.
 */
export const ResolveCommand = (
  predicate: string,
  ...args: string[]
): boolean => {
  switch (predicate) {
    case HELP_PREDICATE:
      Help({ predicate, args } as Command);
      return true;
  }

  return false;
};
