import React from "react";
import { HelpFlag, VersionFlag } from "../constants/commands/flags.ts";
import { BaseCommand, type Command } from "../lib/command.ts";
import { Version } from "../features/version/ui.tsx";
import { runTui } from "../lib/tui.ts";

type RootCommandInit = {
  name: string;
  description: string;
  version: string;
  commands: Command[];
};

const RootCommandFlag = { ...HelpFlag, ...VersionFlag };
const RootCommandOption = {};

type RootCommandFlagType = typeof RootCommandFlag;
type RootCommandOptionType = typeof RootCommandOption;

export class RootCommand
  extends BaseCommand<RootCommandFlagType, RootCommandOptionType> {
  name: string;
  version: string;
  description: string;
  commands: Command[];
  defaultFlags: RootCommandFlagType = RootCommandFlag;
  defaultOptions: RootCommandOptionType = RootCommandOption;

  constructor(options: RootCommandInit) {
    super();
    this.name = options.name;
    this.version = options.version;
    this.description = options.description;
    this.commands = options.commands;
  }

  async execute(
    remainingArgs: string[],
    consumedArgs: string[] = [this.name],
    flags: RootCommandFlagType = RootCommandFlag,
    options: RootCommandOptionType = RootCommandOption,
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

    if (parsed.version) {
      const version = React.createElement(Version, {
        name: this.name,
        version: this.version,
      });

      await runTui(version);
      return;
    }

    await this.help(consumedArgs);
  }
}
