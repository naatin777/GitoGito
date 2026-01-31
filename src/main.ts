import { Command } from "@cliffy/command";
import DemmitHub from "../deno.json" with { type: "json" };
import { commitCommand } from "./commands/commit.tsx";
import { configCommand } from "./commands/config.tsx";
import { initCommand } from "./commands/init.tsx";
import { issueCommand } from "./commands/issue.tsx";

if (import.meta.main) {
  await new Command()
    .name(DemmitHub.name)
    .version(DemmitHub.version)
    .description(DemmitHub.description)
    .command("init", initCommand)
    .command("config", configCommand)
    .command("issue", issueCommand)
    .command("commit", commitCommand)
    .parse(Deno.args);
}
