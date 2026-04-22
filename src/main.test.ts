import { expect, test } from "bun:test";
import packageJson from "../package.json" with { type: "json" };
import { createAppDependencies } from "./app/app_extra.ts";
import { createMainCommand } from "./main.ts";

test("createMainCommand sets the name from package.json", () => {
  const cmd = createMainCommand();
  expect(cmd.getName()).toBe(packageJson.name);
});

test("createMainCommand sets the description from package.json", () => {
  const cmd = createMainCommand();
  expect(cmd.getDescription()).toBe(packageJson.description);
});

test("createMainCommand registers init, config, issue, commit, completions subcommands", () => {
  const cmd = createMainCommand();
  const names = cmd.getCommands(true).map((c) => c.getName());
  expect(names).toContain("init");
  expect(names).toContain("config");
  expect(names).toContain("issue");
  expect(names).toContain("commit");
  expect(names).toContain("completions");
});

test("createMainCommand passes noColor to help settings", () => {
  const dependencies = createAppDependencies();
  const env = dependencies.env;
  env.getNoColor = () => true;
  const noColorCmd = createMainCommand(dependencies);
  env.getNoColor = () => false;
  const defaultCmd = createMainCommand(dependencies);
  expect(noColorCmd.getName()).toBe(defaultCmd.getName());
});
