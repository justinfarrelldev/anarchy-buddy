import { IsCommand } from "../command";

describe("IsCommand", () => {
  it("can tell if an input is a command or not", () => {
    const input1 = "ab help",
      input2 = "ab create",
      input3 = "abs are hard to work out",
      input4 = "absolutely";

    expect(IsCommand(input1)).toBe(true);
    expect(IsCommand(input2)).toBe(true);
    expect(IsCommand(input3)).toBe(false);
    expect(IsCommand(input4)).toBe(false);
  });
});
