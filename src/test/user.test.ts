import { UserList, UsingCommandList } from "../user";

describe("UserList", () => {
  it("can be added to", () => {
    const userList = new UserList();
    userList.AddToUsingCommandList({
      username: "Test",
      discriminator: "1234",
      commandPredicate: "help",
    } as UsingCommandList);

    expect(userList.usingCommandList).toHaveLength(1);
    expect(userList.usingCommandList[0]).toMatchObject({
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
    expect(userList.usingCommandList[0]).toMatchObject({
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
