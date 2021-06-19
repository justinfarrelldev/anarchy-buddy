import { COMMAND_LIST } from "./commands/index";

export interface UserInfo {
  username: string;
  discriminator: string;
}

export type UsingCommandList = UserInfo & {
  commandPredicate: string;
};

export class UserList {
  usingCommandList: string[] = []; // string so we can JSON.stringify it because Javascript loves to be weird when objects and arrays are involved
  /**
   * Creates an input array which is only accessible through getters and setters to set the users that are
   * currently using a command
   */

  public AddToUsingCommandList = (newEntry: UsingCommandList) =>
    this.usingCommandList.push(JSON.stringify(newEntry));

  public RemoveFromUsingCommandList = (entryToRemove: UsingCommandList) =>
    (this.usingCommandList = this.usingCommandList.filter(
      (userCommand) => JSON.stringify(entryToRemove) != userCommand
    ));
  public IncludedInUserList = (entryToCheck: UsingCommandList) => {
    return this.usingCommandList.includes(JSON.stringify(entryToCheck));
  };
  public UserInUserList = (userInfo: UserInfo) => {
    return this.usingCommandList.some((usingCommand) => {
      const parsed = JSON.parse(usingCommand);
      return (
        parsed.username === userInfo.username &&
        parsed.discriminator === userInfo.discriminator
      );
    });
  };

  public UserInListExceptPredicate = (
    userInfo: UserInfo,
    excludedPredicate: string
  ) => {
    return this.usingCommandList.some((usingCommand) => {
      const parsed = JSON.parse(usingCommand);
      return (
        parsed.username === userInfo.username &&
        parsed.discriminator === userInfo.discriminator &&
        parsed.commandPredicate !== excludedPredicate
      );
    });
  };
}
