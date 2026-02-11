import { Command } from "@cliffy/command";
import { ConfigUI } from "../features/config/ui.tsx";
import { flatSchema } from "../helpers/flat_schema.ts";
import { runTuiWithRedux } from "../lib/runner.tsx";
import { ConfigSchema } from "../services/config/schema/config.ts";

function buildSubcommands(
  root: { command: (name: string, cmd: Command) => unknown },
  items: ReturnType<typeof flatSchema>,
  depth = 0,
) {
  for (const item of items) {
    if (item.parents.length !== depth) continue;

    const cmd = new Command()
      .description(`Configure ${[...item.parents, item.key].join(".")}`);

    if (item.isLeaf) {
      cmd.option("--set <value:string>", "Set value for this config key.")
        .action(async ({ set }) => {
          if (set) {
            console.log(set);
            console.log(item);
          } else {
            await runTuiWithRedux(
              <ConfigUI
                flattenConfigSchema={items}
              />,
            );
          }
        });
    } else {
      cmd.action(async () => {
        await runTuiWithRedux(
          <ConfigUI
            flattenConfigSchema={items}
          />,
        );
      });
    }

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

export const configCommand = new Command()
  .description("Configure the repository")
  .action(async () => {
    await runTuiWithRedux(
      <ConfigUI
        flattenConfigSchema={flatSchema(ConfigSchema)}
      />,
    );
  });

buildSubcommands(configCommand, flatSchema(ConfigSchema));
