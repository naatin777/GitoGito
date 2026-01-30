import { Command } from "@cliffy/command";
import { editorCommand } from "./config/editor.ts";
import { languageCommand } from "./config/language.ts";
import { overviewCommand } from "./config/overview.ts";

export const configCommand = new Command()
  .description("Configure the repository")
  .option("--local", "Set local settings.")
  .option("--global", "Set global settings.")
  .command("language", languageCommand)
  .command("editor", editorCommand)
  .command("overview", overviewCommand);
