import { Command } from "@cliffy/command";
import { CompletionsCommand } from "@cliffy/command/completions";
import packageJson from "../package.json" with { type: "json" };
import { commitCommand } from "./commands/commit.tsx";
import { configCommand } from "./commands/config.tsx";
import { initCommand } from "./commands/init.tsx";
import { issueCommand } from "./commands/issue.tsx";
import { tuiCommand } from "./commands/tui.tsx";

if (import.meta.main) {
  const program = new Command()
    .name(packageJson.name)
    .version(packageJson.version)
    .description(packageJson.description)
    .action(function () {
      this.showHelp();
    });

  program.command("init", initCommand);
  program.command("config", configCommand);
  program.command("issue", issueCommand);
  program.command("commit", commitCommand);
  program.command("tui", tuiCommand);
  program.command("completions", new CompletionsCommand());

  await program.parse(process.argv.slice(2));
}
