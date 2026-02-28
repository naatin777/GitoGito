import { Command } from "@cliffy/command";
import { flatSchema } from "../helpers/flat_schema.ts";
import { runTuiWithRedux } from "../lib/runner.tsx";
import { configService } from "../services/config/config_service.ts";
import { ConfigSchema } from "../services/config/schema/config.ts";
import { RouterUI } from "../views/router/ui.tsx";
import {
  normalizeConfigValue,
  parseCliConfigValue,
  resolveConfigScope,
} from "./config_value_parser.ts";

async function openConfigTui() {
  await runTuiWithRedux(<RouterUI initialPath="/config" />);
}

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
        .action(async (options: {
          set?: string;
          project?: boolean;
          local?: boolean;
          global?: boolean;
        }) => {
          if (!options.set) {
            await openConfigTui();
            return;
          }

          const keyPath = [...item.parents, item.key].join(".");
          const parsedInput = parseCliConfigValue(options.set);
          const mergedConfig = await configService.getMergedConfig();
          const normalized = normalizeConfigValue(
            mergedConfig,
            keyPath,
            parsedInput,
          );
          if (!normalized.ok) {
            console.error(normalized.message);
            process.exitCode = 1;
            return;
          }

          const configScope = resolveConfigScope(options);
          await configService.saveConfig(
            configScope,
            keyPath as never,
            normalized.value as never,
          );
          console.log(`Saved ${keyPath} to ${configScope} config.`);
        });
    } else {
      cmd.action(async () => {
        await openConfigTui();
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
  .globalOption("--project", "Set project settings.", {
    conflicts: ["local", "global"],
  })
  .globalOption("--local", "Set local settings.", {
    conflicts: ["project", "global"],
  })
  .globalOption("--global", "Set global settings.", {
    conflicts: ["project", "local"],
  })
  .action(async () => {
    await openConfigTui();
  });

buildSubcommands(configCommand, flatSchema(ConfigSchema));
