import { BaseCommand, type Command } from "../lib/command.ts";
import { SetupFlow } from "../components/SetupFlow.tsx";
import React from "react";
import {
  GlobalFlag,
  HelpFlag,
  LocalFlag,
} from "../constants/commands/flags.ts";
import { envService } from "../services/env.ts";
import { ConfigService } from "../services/config.ts";
import { runTui } from "../lib/tui.ts";

const InitCommandFlag = { ...HelpFlag, ...LocalFlag, ...GlobalFlag };
const InitCommandOption = {};

type InitCommandFlagType = typeof InitCommandFlag;
type InitCommandOptionType = typeof InitCommandOption;

export class InitCommand
  extends BaseCommand<InitCommandFlagType, InitCommandOptionType> {
  name: string = "init";
  description: string = "Initialize a new project";
  commands: Command[] = [];
  defaultFlags: InitCommandFlagType = InitCommandFlag;
  defaultOptions: InitCommandOptionType = InitCommandOption;

  async execute(
    remainingArgs: string[],
    consumedArgs: string[],
    flags: InitCommandFlagType,
    options: InitCommandOptionType,
  ): Promise<void> {
    const parsed = this.parseArgs(remainingArgs, flags, options);

    if (parsed._.length > 0) {
      await this.executeSubCommand(
        parsed,
        consumedArgs,
        flags,
        options,
      );
      return;
    }

    if (parsed.help) {
      await this.help(consumedArgs);
      return;
    }

    const configService = ConfigService.createFromFlags(parsed, envService);
    const config = await configService.getMerged();
    if (config) {
      console.error("Config already exists");
      return;
    }
    await runTui(React.createElement(SetupFlow));
  }
}
