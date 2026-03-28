import { Command } from "@cliffy/command";
import { CompletionsCommand } from "@cliffy/command/completions";
import packageJson from "../../package.json" with { type: "json" };
import { commitCommand } from "./commit.tsx";
import { configCommand } from "./config.tsx";
import { initCommand } from "./init.tsx";
import { issueCommand } from "./issue.tsx";
import { tuiCommand } from "./tui.tsx";

function createDefaultCommands() {
  return {
    init: initCommand,
    config: configCommand,
    issue: issueCommand,
    commit: commitCommand,
    tui: tuiCommand,
    completions: new CompletionsCommand(),
  };
}

type ProgramCommands = ReturnType<typeof createDefaultCommands>;

type ProgramOptions = {
  commands?: Partial<ProgramCommands>;
  throwErrors?: boolean;
  noExit?: boolean;
};

export function createProgram(options: ProgramOptions = {}) {
  const commands = {
    ...createDefaultCommands(),
    ...options.commands,
  };

  let program = new Command()
    .name(packageJson.name)
    .version(packageJson.version)
    .description(packageJson.description)
    .action(function () {
      this.showHelp();
    });

  if (options.throwErrors) {
    program = program.throwErrors();
  }

  if (options.noExit) {
    program = program.noExit();
  }

  program.command("init", commands.init);
  program.command("config", commands.config);
  program.command("issue", commands.issue);
  program.command("commit", commands.commit);
  program.command("tui", commands.tui);
  program.command("completions", commands.completions);

  return program;
}
