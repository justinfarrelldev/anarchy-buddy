import { COMMAND_LIST } from "./commands/index";

export interface UsingCommandList {
  username: string;
  discriminator: string;
  commandPredicate: string;
}

export class UserList {
  usingCommandList: UsingCommandList[] = [];
  /**
   * Creates an input array which is only accessible through getters and setters to set the users that are
   * currently using a command
   */

  public AddToUsingCommandList = (newEntry: UsingCommandList) =>
    this.usingCommandList.push(newEntry);

  public RemoveFromUsingCommandList = (entryToRemove: UsingCommandList) =>
    (this.usingCommandList = this.usingCommandList.splice(
      this.usingCommandList.indexOf(entryToRemove),
      1
    ));
  public IncludedInUserList = (entryToCheck: UsingCommandList) => {
    return this.usingCommandList.some(
      (usingCommand) =>
        usingCommand.username === entryToCheck.username &&
        usingCommand.discriminator === entryToCheck.discriminator &&
        usingCommand.commandPredicate === entryToCheck.commandPredicate
    );
  };
}
