import DemmitHub from "../deno.json" with { type: "json" };
import { CommitCommand } from "./commands/commit.ts";
import { ConfigCommand } from "./commands/config.ts";
import { EditorCommand } from "./commands/config/editor.ts";
import { LanguageCommand } from "./commands/config/language.ts";
import { OverviewCommand } from "./commands/config/overview.ts";
import { InitCommand } from "./commands/init.ts";
import { IssueCommand } from "./commands/issue.ts";
import { RootCommand } from "./commands/root.ts";

if (import.meta.main) {
  const app = new RootCommand({
    name: DemmitHub.name,
    description: DemmitHub.description,
    version: DemmitHub.version,
    commands: [
      new InitCommand(),
      new ConfigCommand([
        new LanguageCommand(),
        new EditorCommand(),
        new OverviewCommand(),
      ]),
      new IssueCommand(),
      new CommitCommand(),
    ],
  });

  await app.execute(Deno.args);
}
