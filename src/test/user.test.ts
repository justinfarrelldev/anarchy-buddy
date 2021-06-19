import { CREATE_PREDICATE } from "../commands/create";
import { HELP_PREDICATE } from "../commands/help";
import { UserList, UsingCommandList } from "../user";

beforeEach(() => {
  jest.useFakeTimers();
});

describe("UserList", () => {
  it("can be added to", () => {
    const userList = new UserList();
    userList.AddToUsingCommandList({
      username: "Test",
      discriminator: "1234",
      commandPredicate: "help",
    } as UsingCommandList);

    expect(userList.usingCommandList).toHaveLength(1);
    expect(JSON.parse(userList.usingCommandList[0])).toMatchObject({
      username: "Test",
      discriminator: "1234",
      commandPredicate: "help",
    } as UsingCommandList);
  });
});

describe("UserList", () => {
  it("can be removed from", () => {
    const userList = new UserList();
    userList.AddToUsingCommandList({
      username: "New Test",
      discriminator: "1234",
      commandPredicate: "help",
    } as UsingCommandList);

    userList.AddToUsingCommandList({
      username: "New Test 2",
      discriminator: "4321",
      commandPredicate: "create",
    } as UsingCommandList);

    userList.RemoveFromUsingCommandList({
      username: "New Test",
      discriminator: "1234",
      commandPredicate: "help",
    } as UsingCommandList);

    expect(userList.usingCommandList).toHaveLength(1);
    expect(JSON.parse(userList.usingCommandList[0])).toMatchObject({
      username: "New Test 2",
      discriminator: "4321",
      commandPredicate: "create",
    } as UsingCommandList);
  });
});

describe("UserList", () => {
  it("can be checked for if an item is contained in it", () => {
    const userList = new UserList();
    userList.AddToUsingCommandList({
      username: "Test",
      discriminator: "1234",
      commandPredicate: "help",
    } as UsingCommandList);

    userList.AddToUsingCommandList({
      username: "New Test 2",
      discriminator: "4321",
      commandPredicate: "create",
    } as UsingCommandList);

    expect(
      userList.IncludedInUserList({
        username: "Test",
        discriminator: "1234",
        commandPredicate: "help",
      } as UsingCommandList)
    ).toBe(true);

    expect(
      userList.IncludedInUserList({
        username: "New Test 2",
        discriminator: "4321",
        commandPredicate: "create",
      } as UsingCommandList)
    ).toBe(true);

    expect(
      userList.IncludedInUserList({
        username: "Failing Test",
        discriminator: "4321",
        commandPredicate: "create",
      } as UsingCommandList)
    ).toBe(false);
  });
});

describe("UserList", () => {
  it("can be checked for if a user is in it", () => {
    const userList = new UserList();
    userList.AddToUsingCommandList({
      username: "Test",
      discriminator: "1234",
      commandPredicate: "help",
    } as UsingCommandList);

    userList.AddToUsingCommandList({
      username: "New Test 2",
      discriminator: "4321",
      commandPredicate: "create",
    } as UsingCommandList);

    expect(
      userList.UserInUserList({
        username: "Test",
        discriminator: "1234",
      } as UsingCommandList)
    ).toBe(true);

    expect(
      userList.UserInUserList({
        username: "New Test 2",
        discriminator: "4321",
      } as UsingCommandList)
    ).toBe(true);

    expect(
      userList.UserInUserList({
        username: "Failing Test",
        discriminator: "4321",
      } as UsingCommandList)
    ).toBe(false);
  });
});

describe("UserList", () => {
  it("can be checked for if a user is in it except if it's only for a certain command", () => {
    const userList = new UserList();
    userList.AddToUsingCommandList({
      username: "Test",
      discriminator: "1234",
      commandPredicate: "help",
    } as UsingCommandList);

    userList.AddToUsingCommandList({
      username: "New Test 2",
      discriminator: "4321",
      commandPredicate: "create",
    } as UsingCommandList);

    expect(
      userList.UserInListExceptPredicate(
        {
          username: "Test",
          discriminator: "1234",
        } as UsingCommandList,
        CREATE_PREDICATE
      )
    ).toBe(true);

    expect(
      userList.UserInListExceptPredicate(
        {
          username: "New Test 2",
          discriminator: "4321",
        } as UsingCommandList,
        HELP_PREDICATE
      )
    ).toBe(true);

    expect(
      userList.UserInListExceptPredicate(
        {
          username: "Test",
          discriminator: "1234",
        } as UsingCommandList,
        HELP_PREDICATE
      )
    ).toBe(false);
  });
});
