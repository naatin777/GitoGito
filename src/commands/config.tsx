import { Command } from "@cliffy/command";
import { editorCommand } from "./config/editor.tsx";
import { languageCommand } from "./config/language.tsx";
import { overviewCommand } from "./config/overview.tsx";

export const configCommand = new Command()
  .description("Configure the repository")
  .globalOption("--project", "Set project settings.", {
    conflicts: ["local", "global"],
  })
  .globalOption("--local", "Set local settings.", {
    conflicts: ["project", "global"],
  })
  .globalOption("--global", "Set global settings.", {
    conflicts: ["project", "local"],
  })
  .command("language", languageCommand)
  .command("editor", editorCommand)
  .command("overview", overviewCommand);
