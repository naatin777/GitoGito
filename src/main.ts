import { Command } from "@cliffy/command";
import { CompletionsCommand } from "@cliffy/command/completions";
import DemmitHub from "../deno.json" with { type: "json" };
import { commitCommand } from "./commands/commit.tsx";
import { configCommand } from "./commands/config.tsx";
import { initCommand } from "./commands/init.tsx";
import { issueCommand } from "./commands/issue.tsx";

if (import.meta.main) {
  // deno-coverage-ignore-start
  const program = new Command()
    .name(DemmitHub.name)
    .version(DemmitHub.version)
    .description(DemmitHub.description)
    .action(function () {
      this.showHelp();
    });

  program.command("init", initCommand);
  program.command("config", configCommand);
  program.command("issue", issueCommand);
  program.command("commit", commitCommand);
  program.command("completions", new CompletionsCommand());

  await program.parse(Deno.args);
  // deno-coverage-ignore-stop
}
