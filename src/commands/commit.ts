import { BaseCommand, type Command } from "../lib/command.ts";
import { Commit } from "../features/commit/ui.tsx";
import React from "react";
import { HelpFlag } from "../constants/commands/flags.ts";
import { runTui } from "../lib/tui.ts";

const CommitCommandOption = {};
const CommitCommandFlag = { ...HelpFlag };

type CommitCommandOptionType = typeof CommitCommandOption;
type CommitCommandFlagType = typeof CommitCommandFlag;

export class CommitCommand
  extends BaseCommand<CommitCommandFlagType, CommitCommandOptionType> {
  name: string = "commit";
  description: string = "Commit changes to the repository";
  commands: Command[] = [];
  defaultFlags: CommitCommandFlagType = CommitCommandFlag;
  defaultOptions: CommitCommandOptionType = CommitCommandOption;

  async execute(
    remainingArgs: string[],
    consumedArgs: string[],
    flags: CommitCommandFlagType,
    options: CommitCommandOptionType,
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

    const commit = React.createElement(Commit, null);
    await runTui(commit);
  }
}
