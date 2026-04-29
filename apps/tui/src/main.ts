import { Command } from "@cliffy/command";

import { CompletionsCommand } from "@cliffy/command/completions";
import { UpgradeCommand } from "@cliffy/command/upgrade";
import { NpmProvider } from "@cliffy/command/upgrade/provider/npm";
import packageJson from "../package.json" with { type: "json" };
import { createConfigCommand } from "./app/commands/config-command.js";
import type { AppDeps } from "./app/make-deps.js";
import { makeDeps } from "./app/make-deps.js";

export function createAppCommand(deps: AppDeps) {
  return new Command()
    .name(packageJson.displayName)
    .version(packageJson.version)
    .description(packageJson.description)
    .action(function () {
      this.showHelp();
    })
    .globalEnv("NO_COLOR", "No color mode")
    .globalEnv("CI", "CI environment")
    .globalOption("-j, --json", "JSON mode")
    .globalOption("-d, --dry-run", "Dry run mode")
    .globalOption("-v, --verbose", "Verbose mode")
    .command("init", new Command())
    .command("config", createConfigCommand(deps))
    .command("add", new Command())
    .command("commit", new Command())
    .command("branch", new Command())
    .command("issue", new Command())
    .command("pr", new Command())
    .command("doctor", new Command())
    .command("show", new Command())
    .command("upgrade", new UpgradeCommand({ provider: [new NpmProvider()] }))
    .command("completions", new CompletionsCommand())
    .hidden();
}

if (import.meta.main) {
  await createAppCommand(makeDeps()).parse(Bun.argv.slice(2));
}
