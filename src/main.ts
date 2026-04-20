import { Command } from "@cliffy/command";
import { CompletionsCommand } from "@cliffy/command/completions";
import { UpgradeCommand } from "@cliffy/command/upgrade";
import { NpmProvider } from "@cliffy/command/upgrade/provider/npm";
import packageJson from "../package.json" with { type: "json" };
import { createAppDependencies } from "./app/app_extra.ts";
import type { AppDependencies } from "./app/store.ts";
import { createCommitCommand } from "./commands/commit.tsx";
import { createConfigCommand } from "./commands/config.tsx";
import { createInitCommand } from "./commands/init.tsx";
import { createIssueCommand } from "./commands/issue.tsx";
import { ENV_KEYS } from "./repositories/env/env_repository.ts";

export function createMainCommand(
  dependencies: AppDependencies = createAppDependencies(),
) {
  return new Command()
    .name(packageJson.name)
    .version(packageJson.version)
    .description(packageJson.description)
    .globalEnv(ENV_KEYS.NO_COLOR.key, ENV_KEYS.NO_COLOR.description)
    .globalEnv(ENV_KEYS.OPEN_ROUTER_API_KEY.key, ENV_KEYS.OPEN_ROUTER_API_KEY.description)
    .globalEnv(ENV_KEYS.GEMINI_API_KEY.key, ENV_KEYS.GEMINI_API_KEY.description)
    .globalEnv(ENV_KEYS.GITHUB_TOKEN.key, ENV_KEYS.GITHUB_TOKEN.description)
    .help({
      colors: !dependencies.env.getNoColor(),
    })
    .action(function () {
      this.showHelp();
    })
    .command("init", createInitCommand(dependencies))
    .command("config", createConfigCommand(dependencies))
    .command("issue", createIssueCommand(dependencies))
    .command("commit", createCommitCommand(dependencies))
    .command("completions", new CompletionsCommand())
    .command("upgrade", new UpgradeCommand({ provider: [new NpmProvider()] }),);
}

if (import.meta.main) {
  const dependencies = createAppDependencies();
  await createMainCommand(dependencies).parse(Bun.argv.slice(2));
}
