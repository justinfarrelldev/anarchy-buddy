import { COMMAND_LIST } from "./commands/index";

export interface UserInfo {
  username: string;
  discriminator: string;
}

export type UsingCommandList = UserInfo & {
  commandPredicate: string;
};

export class UserList {
  usingCommandList: UsingCommandList[] = [];
  /**
   * Creates an input array which is only accessible through getters and setters to set the users that are
   * currently using a command
   */

  public AddToUsingCommandList = (newEntry: UsingCommandList) =>
    this.usingCommandList.push(newEntry as UsingCommandList);

  public RemoveFromUsingCommandList = (entryToRemove: UsingCommandList) =>
    (this.usingCommandList = this.usingCommandList.splice(
      this.usingCommandList.indexOf(entryToRemove as UsingCommandList),
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
  public UserInUserList = (userInfo: UserInfo) => {
    return this.usingCommandList.some(
      (usingCommand) =>
        usingCommand.username === userInfo.username &&
        usingCommand.discriminator === userInfo.discriminator
    );
  };

  public UserInListExceptPredicate = (
    userInfo: UserInfo,
    excludedPredicate: string
  ) => {
    return this.usingCommandList.some(
      (usingCommand) =>
        usingCommand.username === userInfo.username &&
        usingCommand.discriminator === userInfo.discriminator &&
        usingCommand.commandPredicate !== excludedPredicate
    );
  };
}
