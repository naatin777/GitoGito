import { BaseCommand, type Command } from "../../lib/command.ts";
import { ConfigService } from "../../services/config.ts";
import { LanguageSelector } from "../../components/Selection.tsx";
import React from "react";
import {
  ConfigCommandFlag,
  type ConfigCommandFlagType,
  ConfigCommandOption,
  type ConfigCommandOptionType,
} from "../config.ts";
import { envService } from "../../services/env.ts";
import { runTui } from "../../lib/tui.ts";

export class LanguageCommand
  extends BaseCommand<ConfigCommandFlagType, ConfigCommandOptionType> {
  name: string = "language";
  description: string = "Configure the language";
  commands: Command[] = [];
  defaultFlags: ConfigCommandFlagType = ConfigCommandFlag;
  defaultOptions: ConfigCommandOptionType = ConfigCommandOption;

  async execute(
    remainingArgs: string[],
    consumedArgs: string[],
    flags: ConfigCommandFlagType,
    options: ConfigCommandOptionType,
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

    runTui(
      React.createElement(LanguageSelector, {
        onSelect: async (language: string) => {
          const configService = ConfigService.createFromFlags(
            parsed,
            envService,
          );
          const localConfig = await configService.getMerged();
          localConfig.language = language;
          await configService.save(localConfig);
        },
      }),
    );
  }
}
