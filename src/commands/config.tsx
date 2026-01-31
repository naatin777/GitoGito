import { Command } from "@cliffy/command";
import { ConfigUI } from "../features/config/ui.tsx";
import { runTuiWithRedux } from "../lib/runner.tsx";
import { editorCommand } from "./config/editor.tsx";
import { languageCommand } from "./config/language.tsx";
import { overviewCommand } from "./config/overview.tsx";

export const configCommand = new Command()
  .description("Configure the repository")
  .option("--project", "Set project settings.", {
    conflicts: ["local", "global"],
  })
  .option("--local", "Set local settings.", {
    conflicts: ["project", "global"],
  })
  .option("--global", "Set global settings.", {
    conflicts: ["project", "local"],
  })
  .command("language", languageCommand)
  .command("editor", editorCommand)
  .command("overview", overviewCommand)
  .action(async () => {
    await runTuiWithRedux(<ConfigUI />);
  });
