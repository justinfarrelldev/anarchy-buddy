// Module map to show predicates and execute them if they are encountered

import { Message } from "discord.js";
import { userList } from "..";
import { ERRORS } from "../constants";
import { Add, ADD_DESCRIPTION, ADD_PREDICATE } from "./add";
import { Create, CREATE_DESCRIPTION, CREATE_PREDICATE } from "./create";
import { Help, HELP_DESCRIPTION, HELP_PREDICATE } from "./help";
import { List, LIST_DESCRIPTION, LIST_PREDICATE } from "./list";
import { Remove, REMOVE_DESCRIPTION, REMOVE_PREDICATE } from "./remove";

// ANCHOR[id=command_list_anchor] The command list
export const COMMAND_LIST = {
  [HELP_PREDICATE]: HELP_DESCRIPTION,
  [CREATE_PREDICATE]: CREATE_DESCRIPTION,
  [LIST_PREDICATE]: LIST_DESCRIPTION,
  [ADD_PREDICATE]: ADD_DESCRIPTION,
  [REMOVE_PREDICATE]: REMOVE_DESCRIPTION,
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
  if (
    userList.UserInUserList({
      username: msg.author.username,
      discriminator: msg.author.discriminator,
    })
  ) {
    msg.channel.send(`${ERRORS.COMMAND_IN_PROGRESS}`);
    return;
  }

  // ANCHOR[id=command_switch_anchor] The command switch statement
  switch (messageTokens[1]) {
    case HELP_PREDICATE:
      return Help(msg, command);
    case CREATE_PREDICATE:
      return await Create(msg, command);
    case LIST_PREDICATE:
      return List(msg, command);
    case ADD_PREDICATE:
      return Add(msg, command);
    case REMOVE_PREDICATE:
      return Remove(msg, command);
  }
};

/*
 * Initializes a command to run. Used at the beginning of every command.
 */

export const InitializeCommand = (msg: Message, predicate: string) => {
  userList.AddToUsingCommandList({
    username: msg.author.username,
    discriminator: msg.author.discriminator,
    commandPredicate: predicate,
  });
};

/*
 * Cleans up after a command has run. Should run once a command goes through its full cycle.
 */

export const CleanUpAfterCommand = (msg: Message, predicate: string) => {
  userList.RemoveFromUsingCommandList({
    username: msg.author.username,
    discriminator: msg.author.discriminator,
    commandPredicate: predicate,
  });
};
