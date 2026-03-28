import { expect, test } from "bun:test";
import { Command } from "@cliffy/command";
import { flatSchema } from "../helpers/flat_schema.ts";
import { ConfigSchema } from "../services/config/schema/config.ts";
import { createCommitCommand } from "./commit.tsx";
import { createConfigCommand } from "./config.tsx";
import { createInitCommand } from "./init.tsx";
import { createIssueCommand } from "./issue.tsx";
import { createProgram } from "./program.ts";

type ConfigOptions = {
  set?: string;
  project?: boolean;
  local?: boolean;
  global?: boolean;
};

interface TopLevelActions {
  init: (opts: { local?: boolean; global?: boolean }) => Promise<void>;
  commit: () => Promise<void>;
  issue: () => Promise<void>;
  config: (opts: ConfigOptions) => Promise<void>;
}

function createTestProgram(actions: TopLevelActions): Command {
  return createProgram({
    throwErrors: true,
    noExit: true,
    commands: {
      init: createInitCommand({
        configFile: {
          exists: async () => false,
          save: async () => {},
        },
        writeInfo: (_message: string) => {},
        writeError: (_message: string) => {},
      }).action(actions.init),
      config: createConfigCommand({
        openConfigTui: actions.config,
        getMergedConfig: async () => ConfigSchema.parse({}),
        saveConfig: async () => {},
        writeError: () => {},
        writeInfo: () => {},
      }),
      issue: createIssueCommand(actions.issue),
      commit: createCommitCommand(actions.commit),
      tui: new Command().description("Open interactive TUI home").action(async () => {}),
      completions: new Command().description("completions").action(async () => {}),
    },
  });
}

function createSpies() {
  let initCalls = 0;
  let commitCalls = 0;
  let issueCalls = 0;
  const configCalls: ConfigOptions[] = [];

  return {
    actions: {
      init: async () => {
        initCalls += 1;
      },
      commit: async () => {
        commitCalls += 1;
      },
      issue: async () => {
        issueCalls += 1;
      },
      config: async (opts: ConfigOptions) => {
        configCalls.push(opts);
      },
    } satisfies TopLevelActions,
    counts: () => ({ initCalls, commitCalls, issueCalls, configCalls }),
  };
}

const leafPaths = flatSchema(ConfigSchema)
  .filter((item) => item.isLeaf)
  .map((item) => [...item.parents, item.key]);

test("init - action is called", async () => {
  const spies = createSpies();
  const program = createTestProgram(spies.actions);
  await program.parse(["init"]);
  expect(spies.counts().initCalls).toEqual(1);
});

test("commit - action is called", async () => {
  const spies = createSpies();
  const program = createTestProgram(spies.actions);
  await program.parse(["commit"]);
  expect(spies.counts().commitCalls).toEqual(1);
});

test("issue - action is called", async () => {
  const spies = createSpies();
  const program = createTestProgram(spies.actions);
  await program.parse(["issue"]);
  expect(spies.counts().issueCalls).toEqual(1);
});

test("config --project - option is received", async () => {
  const spies = createSpies();
  const program = createTestProgram(spies.actions);
  await program.parse(["config", "--project"]);
  expect(spies.counts().configCalls[0]).toEqual({ project: true });
});

test("config --project --local - throws ValidationError", async () => {
  const spies = createSpies();
  const program = createTestProgram(spies.actions);
  try {
    await program.parse(["config", "--project", "--local"]);
    expect(true).toEqual(false);
  } catch (error) {
    expect((error as Error).message).toEqual(
      'Option "--project" conflicts with option "--local".',
    );
  }
});

test("config ai provider --global - globalOption is inherited", async () => {
  const spies = createSpies();
  const program = createTestProgram(spies.actions);
  const result = await program.parse(["config", "ai", "provider", "--global"]);
  expect(result.cmd?.getName()).toEqual("provider");
  expect(result.options as unknown).toEqual({ global: true });
});

test("all config leaf subcommands resolve", async () => {
  for (const path of leafPaths) {
    const spies = createSpies();
    const program = createTestProgram(spies.actions);
    const result = await program.parse(["config", ...path]);
    expect(result.cmd?.getName()).toEqual(path[path.length - 1]);
  }
});
