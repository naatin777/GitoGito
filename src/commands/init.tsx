import { Command } from "@cliffy/command";
import { configFile, type ConfigFile, type ConfigScope } from "../services/config/file.ts";

export type InitCommandOptions = {
  local?: boolean;
  global?: boolean;
};

type InitCommandDependencies = {
  configFile: Pick<ConfigFile, "exists" | "save">;
  writeInfo: (message: string) => void;
  writeError: (message: string) => void;
};

function resolveInitScope(options: InitCommandOptions): ConfigScope {
  if (options.global) {
    return "global";
  }

  if (options.local) {
    return "local";
  }

  return "project";
}

export function createInitCommand(
  dependencies: Partial<InitCommandDependencies> = {},
) {
  const {
    configFile: commandConfigFile = configFile,
    writeInfo = console.log,
    writeError = console.error,
  } = dependencies;

  return new Command()
    .description("Initialize a new project")
    .option("--local", "Set local settings.", {
      conflicts: ["global"],
    })
    .option("--global", "Set global settings.", {
      conflicts: ["local"],
    })
    .action(async (options: InitCommandOptions) => {
      const scope = resolveInitScope(options);

      if (await commandConfigFile.exists(scope)) {
        writeError(`${scope} config already exists.`);
        return;
      }

      await commandConfigFile.save(scope, "{}\n");
      writeInfo(`Initialized ${scope} config.`);
    });
}

export const initCommand = createInitCommand();
