/*
 * This is the list command and all related functionality.
 */

import { Command } from "../../command";
import { Message } from "discord.js";
import { docClient } from "../..";

export const LIST_PREDICATE = "list";
export const LIST_DESCRIPTION = "Lists various information regarding groups.";
export const LIST_USAGE = "list [group | groups]"; // group and groups both do the same thing, but it would be best to make both list the groups

const listPublicGroups = (msg: Message) => {
}

export const List = (msg: Message, command: Command) => {
    switch (command.args[0]) {
        case 'group' || 'groups':
            
            return true

    }
};
