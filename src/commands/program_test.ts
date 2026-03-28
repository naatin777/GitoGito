import { expect, test } from "bun:test";
import { Command } from "@cliffy/command";
import { createProgram } from "./program.ts";

test("createProgram includes the expected top-level commands", () => {
  const program = createProgram({ throwErrors: true, noExit: true });
  const names = program.getCommands().map((command) => command.getName());

  expect(names).toEqual([
    "init",
    "config",
    "issue",
    "commit",
    "tui",
    "completions",
  ]);
});

test("createProgram allows overriding commands", () => {
  const customCommit = new Command().description("custom commit");
  const program = createProgram({
    commands: {
      commit: customCommit,
    },
  });

  expect(program.getCommand("commit")).toBe(customCommit);
});
