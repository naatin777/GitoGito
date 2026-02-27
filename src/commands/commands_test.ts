import { expect, test } from "bun:test";
import { Command } from "@cliffy/command";
import { flatSchema } from "../helpers/flat_schema.ts";
import { ConfigSchema } from "../services/config/schema/config.ts";

type ConfigOptions = {
  project?: boolean;
  local?: boolean;
  global?: boolean;
};

interface TopLevelActions {
  init: () => Promise<void>;
  commit: () => Promise<void>;
  issue: () => Promise<void>;
  config: (opts: ConfigOptions) => Promise<void>;
}

function buildSubcommands(
  root: { command: (name: string, cmd: Command) => unknown },
  items: ReturnType<typeof flatSchema>,
  depth = 0,
) {
  for (const item of items) {
    if (item.parents.length !== depth) continue;

    const cmd = new Command()
      .description(`Configure ${[...item.parents, item.key].join(".")}`)
      .action(async () => {});

    if (!item.isLeaf) {
      const children = items.filter(
        (child) =>
          child.parents.length > depth &&
          child.parents[depth] === item.key &&
          child.parents.slice(0, depth).every((p, i) => p === item.parents[i]),
      );
      buildSubcommands(cmd, children, depth + 1);
    }

    root.command(item.key, cmd);
  }
}

function createProgram(actions: TopLevelActions): Command {
  const configCommand = new Command()
    .description("Configure the repository")
    .globalOption("--project", "Set project settings.", {
      conflicts: ["local", "global"],
    })
    .globalOption("--local", "Set local settings.", {
      conflicts: ["project", "global"],
    })
    .globalOption("--global", "Set global settings.", {
      conflicts: ["project", "local"],
    })
    .action(actions.config);

  buildSubcommands(configCommand, flatSchema(ConfigSchema));

  const program = new Command()
    .name("gitogito")
    .version("0.0.0")
    .throwErrors()
    .noExit()
    .action(function () {
      this.showHelp();
    });

  program.command(
    "init",
    new Command()
      .description("Initialize a new project")
      .option("--local", "Set local settings.")
      .option("--global", "Set global settings.")
      .action(actions.init),
  );

  program.command("config", configCommand);

  program.command(
    "issue",
    new Command()
      .description("Manage issues in the repository")
      .action(actions.issue),
  );

  program.command(
    "commit",
    new Command()
      .description("Commit changes to the repository")
      .action(actions.commit),
  );

  return program;
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
  const program = createProgram(spies.actions);
  await program.parse(["init"]);
  expect(spies.counts().initCalls).toEqual(1);
});

test("commit - action is called", async () => {
  const spies = createSpies();
  const program = createProgram(spies.actions);
  await program.parse(["commit"]);
  expect(spies.counts().commitCalls).toEqual(1);
});

test("issue - action is called", async () => {
  const spies = createSpies();
  const program = createProgram(spies.actions);
  await program.parse(["issue"]);
  expect(spies.counts().issueCalls).toEqual(1);
});

test("config --project - option is received", async () => {
  const spies = createSpies();
  const program = createProgram(spies.actions);
  await program.parse(["config", "--project"]);
  expect(spies.counts().configCalls[0]).toEqual({ project: true });
});

test("config --project --local - throws ValidationError", async () => {
  const spies = createSpies();
  const program = createProgram(spies.actions);
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
  const program = createProgram(spies.actions);
  const result = await program.parse(["config", "ai", "provider", "--global"]);
  expect(result.cmd?.getName()).toEqual("provider");
  expect(result.options as unknown).toEqual({ global: true });
});

test("all config leaf subcommands resolve", async () => {
  for (const path of leafPaths) {
    const spies = createSpies();
    const program = createProgram(spies.actions);
    const result = await program.parse(["config", ...path]);
    expect(result.cmd?.getName()).toEqual(path[path.length - 1]);
    expect(spies.counts().configCalls.length).toEqual(0);
  }
});
