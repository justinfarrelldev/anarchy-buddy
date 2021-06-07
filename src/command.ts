/*
 * This is the Command type itself which all subcommands derive from.
 * @param predicate The word which initializes the command.
 * @param args The remaining arguments supplied to the command.
 */
export interface Command {
  predicate: string;
  args: string[];
}
