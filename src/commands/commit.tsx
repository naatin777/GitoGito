import { Command } from "@cliffy/command";
import { Commit } from "../features/commit/ui.tsx";
import { runTui } from "../lib/tui.ts";

export const commitCommand = new Command()
  .description("Commit changes to the repository")
  .action(async () => {
    await runTui(<Commit />);
  });
