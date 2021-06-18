import { COMMAND_LIST } from "./commands/index";

interface UsingCommandList {
  username: string;
  discriminator: string;
  commandPredicate: typeof COMMAND_LIST;
}

export class UserList {
  usingCommandList: UsingCommandList[];
  /**
   * Creates an input array which is only accessible through getters and setters to set the users that are
   * currently using a command
   */

  public AddToUsingCommandList = (newEntry: UsingCommandList) =>
    this.usingCommandList.push(newEntry);

  public RemoveFromUsingCommandList = (entryToRemove: UsingCommandList) =>
    this.usingCommandList.splice(
      this.usingCommandList.indexOf(entryToRemove),
      1
    );
}