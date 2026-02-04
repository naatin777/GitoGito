import { Command } from "@cliffy/command";
import { flatSchema } from "../helpers/flat_schema.ts";
import { ConfigSchema } from "../services/config/schema/config.ts";

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
      // 子アイテムを再帰で登録
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

export const configCommand = new Command()
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
  .action(async () => {});

buildSubcommands(configCommand, flatSchema(ConfigSchema));
