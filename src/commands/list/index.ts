/*
 * This is the list command and all related functionality.
 */

import { Command } from "../../command";
import { Message } from "discord.js";

export const LIST_PREDICATE = "list";
export const LIST_DESCRIPTION = "Lists various information regarding groups.";
export const LIST_USAGE = "list [group | groups]";

export const List = (msg: Message, command: Command) => {};
