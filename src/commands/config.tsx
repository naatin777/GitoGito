import { Command } from "@cliffy/command";
import { flatSchema } from "../helpers/flat_schema.ts";
import { runTuiWithRedux } from "../lib/runner.tsx";
import { configService, type ConfigService } from "../services/config/config_service.ts";
import { ConfigSchema } from "../services/config/schema/config.ts";
import { RouterUI } from "../views/router/ui.tsx";
import {
  normalizeConfigValue,
  parseCliConfigValue,
  resolveConfigScope,
} from "./config_value.ts";

export type ConfigCommandOptions = {
  set?: string;
  project?: boolean;
  local?: boolean;
  global?: boolean;
};

// TODO: Thread CLI scope/options into the TUI when config editing supports them.
export async function openConfigTui(_options?: ConfigCommandOptions) {
  await runTuiWithRedux(<RouterUI initialPath="/config" />);
}

type ConfigCommandDependencies = {
  openConfigTui: (options?: ConfigCommandOptions) => Promise<void>;
  getMergedConfig: ConfigService["getMergedConfig"];
  saveConfig: ConfigService["saveConfig"];
  writeError: (message: string) => void;
  writeInfo: (message: string) => void;
};

export function buildSubcommands(
  root: { command: (name: string, cmd: Command) => unknown },
  items: ReturnType<typeof flatSchema>,
  dependencies: ConfigCommandDependencies,
  depth = 0,
) {
  for (const item of items) {
    if (item.parents.length !== depth) continue;

    const cmd = new Command()
      .description(`Configure ${[...item.parents, item.key].join(".")}`);

    if (item.isLeaf) {
        cmd.option("--set <value:string>", "Set value for this config key.")
          .action(async (options: ConfigCommandOptions) => {
            if (!options.set) {
              await dependencies.openConfigTui(options);
              return;
            }

          const keyPath = [...item.parents, item.key].join(".");
          const parsedInput = parseCliConfigValue(options.set);
          const mergedConfig = await dependencies.getMergedConfig();
          const normalized = normalizeConfigValue(
            mergedConfig,
            keyPath,
            parsedInput,
          );
          if (!normalized.ok) {
            dependencies.writeError(normalized.message);
            process.exitCode = 1;
            return;
          }

          const configScope = resolveConfigScope(options);
          await dependencies.saveConfig(
            configScope,
            keyPath as never,
            normalized.value as never,
          );
          dependencies.writeInfo(`Saved ${keyPath} to ${configScope} config.`);
        });
    } else {
      cmd.action(async () => {
        await dependencies.openConfigTui();
      });
    }

    if (!item.isLeaf) {
      const children = items.filter(
        (child) =>
          child.parents.length > depth &&
          child.parents[depth] === item.key &&
          child.parents.slice(0, depth).every((p, i) => p === item.parents[i]),
      );
      buildSubcommands(cmd, children, dependencies, depth + 1);
    }

    root.command(item.key, cmd);
  }
}

export function createConfigCommand(
  dependencies: Partial<ConfigCommandDependencies> = {},
) {
  const resolvedDependencies: ConfigCommandDependencies = {
    openConfigTui,
    getMergedConfig: () => configService.getMergedConfig(),
    saveConfig: (...args) => configService.saveConfig(...args),
    writeError: console.error,
    writeInfo: console.log,
    ...dependencies,
  };

  const command = new Command()
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
    .action(async (options: ConfigCommandOptions) => {
      await resolvedDependencies.openConfigTui(options);
    });

  buildSubcommands(command, flatSchema(ConfigSchema), resolvedDependencies);
  return command;
}

export const configCommand = createConfigCommand();
