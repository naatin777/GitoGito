import { BaseCommand, type Command } from "../lib/command.ts";
import { Issue } from "../features/issue/ui.tsx";
import React from "react";
import { HelpFlag } from "../constants/commands/flags.ts";
import { runTui } from "../lib/tui.ts";

const IssueCommandFlag = { ...HelpFlag };
const IssueCommandOption = {};

type IssueCommandFlagType = typeof IssueCommandFlag;
type IssueCommandOptionType = typeof IssueCommandOption;

export class IssueCommand
  extends BaseCommand<IssueCommandFlagType, IssueCommandOptionType> {
  name: string = "issue";
  description: string = "Manage issues in the repository";
  commands: Command[] = [];
  defaultFlags: IssueCommandFlagType = IssueCommandFlag;
  defaultOptions: IssueCommandOptionType = IssueCommandOption;

  async execute(
    remainingArgs: string[],
    consumedArgs: string[] = [this.name],
    flags: IssueCommandFlagType,
    options: IssueCommandOptionType,
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

    const issue = React.createElement(Issue, null);
    await runTui(issue);
  }
}
