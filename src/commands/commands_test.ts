import { Command } from "@cliffy/command";
import { assertEquals } from "@std/assert";
import { assertSpyCalls, restore, spy } from "@std/testing/mock";
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

// config.tsx と同じ構築ロジック
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
    .name("demmithub")
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
  return {
    init: spy(async () => {}),
    commit: spy(async () => {}),
    issue: spy(async () => {}),
    config: spy(async (_opts: ConfigOptions) => {}),
  };
}

// スキーマから全リーフキーを収集（ネスト引数配列として）
const leafPaths = flatSchema(ConfigSchema)
  .filter((item) => item.isLeaf)
  .map((item) => [...item.parents, item.key]);

// --- トップレベルコマンド ---

Deno.test("init - action is called", async () => {
  const actions = createSpies();
  const program = createProgram(actions);
  await program.parse(["init"]);
  assertSpyCalls(actions.init, 1);
  restore();
});

Deno.test("commit - action is called", async () => {
  const actions = createSpies();
  const program = createProgram(actions);
  await program.parse(["commit"]);
  assertSpyCalls(actions.commit, 1);
  restore();
});

Deno.test("issue - action is called", async () => {
  const actions = createSpies();
  const program = createProgram(actions);
  await program.parse(["issue"]);
  assertSpyCalls(actions.issue, 1);
  restore();
});

Deno.test("commit - other actions are not called", async () => {
  const actions = createSpies();
  const program = createProgram(actions);
  await program.parse(["commit"]);
  assertSpyCalls(actions.init, 0);
  assertSpyCalls(actions.issue, 0);
  assertSpyCalls(actions.config, 0);
  restore();
});

// --- config コマンド ---

Deno.test("config - action is called", async () => {
  const actions = createSpies();
  const program = createProgram(actions);
  await program.parse(["config"]);
  assertSpyCalls(actions.config, 1);
  restore();
});

Deno.test("config --project - option is received", async () => {
  const actions = createSpies();
  const program = createProgram(actions);
  await program.parse(["config", "--project"]);
  assertSpyCalls(actions.config, 1);
  assertEquals(actions.config.calls[0].args[0], { project: true });
  restore();
});

Deno.test("config --local - option is received", async () => {
  const actions = createSpies();
  const program = createProgram(actions);
  await program.parse(["config", "--local"]);
  assertSpyCalls(actions.config, 1);
  assertEquals(actions.config.calls[0].args[0], { local: true });
  restore();
});

Deno.test("config --global - option is received", async () => {
  const actions = createSpies();
  const program = createProgram(actions);
  await program.parse(["config", "--global"]);
  assertSpyCalls(actions.config, 1);
  assertEquals(actions.config.calls[0].args[0], { global: true });
  restore();
});

// --- config 排他オプション ---

Deno.test("config --project --local - throws ValidationError", async () => {
  const actions = createSpies();
  const program = createProgram(actions);
  try {
    await program.parse(["config", "--project", "--local"]);
    assertEquals(true, false, "should have thrown");
  } catch (e) {
    assertEquals(
      (e as Error).message,
      'Option "--project" conflicts with option "--local".',
    );
  }
  restore();
});

Deno.test("config --project --global - throws ValidationError", async () => {
  const actions = createSpies();
  const program = createProgram(actions);
  try {
    await program.parse(["config", "--project", "--global"]);
    assertEquals(true, false, "should have thrown");
  } catch (e) {
    assertEquals(
      (e as Error).message,
      'Option "--project" conflicts with option "--global".',
    );
  }
  restore();
});

Deno.test("config --local --global - throws ValidationError", async () => {
  const actions = createSpies();
  const program = createProgram(actions);
  try {
    await program.parse(["config", "--local", "--global"]);
    assertEquals(true, false, "should have thrown");
  } catch (e) {
    assertEquals(
      (e as Error).message,
      'Option "--local" conflicts with option "--global".',
    );
  }
  restore();
});

// --- config サブコマンド（スキーマから動的生成） ---
// 各リーフキーがネストされたサブコマンドとして解決されることを検証

for (const path of leafPaths) {
  Deno.test(`config ${path.join(" ")} - subcommand is resolved`, async () => {
    const actions = createSpies();
    const program = createProgram(actions);
    const result = await program.parse(["config", ...path]);
    assertEquals(result.cmd?.getName(), path[path.length - 1]);
    assertSpyCalls(actions.config, 0);
    restore();
  });
}

// --- globalOption がサブコマンドに引き継がれる ---

Deno.test("config ai provider --global - globalOption is inherited", async () => {
  const actions = createSpies();
  const program = createProgram(actions);
  const result = await program.parse([
    "config",
    "ai",
    "provider",
    "--global",
  ]);
  assertEquals(result.cmd?.getName(), "provider");
  assertEquals(result.options as unknown, { global: true });
  restore();
});

Deno.test("config language dialogue --local - globalOption is inherited", async () => {
  const actions = createSpies();
  const program = createProgram(actions);
  const result = await program.parse([
    "config",
    "language",
    "dialogue",
    "--local",
  ]);
  assertEquals(result.cmd?.getName(), "dialogue");
  assertEquals(result.options as unknown, { local: true });
  restore();
});

Deno.test("config commit rules maxHeaderLength --project - globalOption is inherited", async () => {
  const actions = createSpies();
  const program = createProgram(actions);
  const result = await program.parse([
    "config",
    "commit",
    "rules",
    "maxHeaderLength",
    "--project",
  ]);
  assertEquals(result.cmd?.getName(), "maxHeaderLength");
  assertEquals(result.options as unknown, { project: true });
  restore();
});

// --- サブコマンドでも排他オプションが動く ---

Deno.test(
  "config ai provider --project --local - throws ValidationError",
  async () => {
    const actions = createSpies();
    const program = createProgram(actions);
    try {
      await program.parse([
        "config",
        "ai",
        "provider",
        "--project",
        "--local",
      ]);
      assertEquals(true, false, "should have thrown");
    } catch (e) {
      assertEquals(
        (e as Error).message,
        'Option "--project" conflicts with option "--local".',
      );
    }
    restore();
  },
);
