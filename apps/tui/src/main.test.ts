import { expect, spyOn, test } from "bun:test";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Command } from "@cliffy/command";
import { ConfigServiceImpl, MemoryRuntimeEnv } from "@gitogito/core";
import { FsConfigFile, GitogitoConfigPathResolver } from "./entities/config";
import { createAppCommand } from "./main";

test("createAppCommand showHelp if args is empty", async () => {
  const showHelpSpy = spyOn(Command.prototype, "showHelp").mockImplementation(() => {});
  const base = await mkdtemp(join(tmpdir(), "gito-cfg-"));
  const env = new MemoryRuntimeEnv(base, base, join(base, "xdg"));
  const paths = new GitogitoConfigPathResolver(env, "gitogito");
  const file = new FsConfigFile(paths);
  const svc = new ConfigServiceImpl(file);
  const command = createAppCommand({ configService: svc });
  await command.parse([]);
  expect(showHelpSpy).toHaveBeenCalled();
  showHelpSpy.mockRestore();
  await rm(base, { recursive: true, force: true });
});

test("createAppCommand showHelp if args is completions", async () => {
  const showHelpSpy = spyOn(Command.prototype, "showHelp").mockImplementation(() => {});
  const base = await mkdtemp(join(tmpdir(), "gito-cfg-"));
  const env = new MemoryRuntimeEnv(base, base, join(base, "xdg"));
  const paths = new GitogitoConfigPathResolver(env, "gitogito");
  const file = new FsConfigFile(paths);
  const svc = new ConfigServiceImpl(file);
  const command = createAppCommand({ configService: svc });
  const { cmd } = await command.parse(["completions"]);
  expect(cmd.getName()).toContain("completions");
  expect(showHelpSpy).toHaveBeenCalled();
  showHelpSpy.mockRestore();
  await rm(base, { recursive: true, force: true });
});

test("config global set writes user config", async () => {
  const base = await mkdtemp(join(tmpdir(), "gito-cfg-"));
  const xdg = join(base, "xdg");
  const env = new MemoryRuntimeEnv(base, base, xdg);
  const paths = new GitogitoConfigPathResolver(env, "gitogito");
  const file = new FsConfigFile(paths);
  const svc = new ConfigServiceImpl(file);
  const command = createAppCommand({ configService: svc });
  await command.parse(["config", "global", "set", "k", "v"]);
  const raw = await readFile(join(xdg, "gitogito", "config.yaml"), "utf8");
  expect(raw).toContain("k");
  expect(raw).toContain("v");
  await rm(base, { recursive: true, force: true });
});
