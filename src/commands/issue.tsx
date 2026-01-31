import { Command } from "@cliffy/command";
import { Issue } from "../features/issue/ui.tsx";
import { runTui } from "../lib/tui.ts";

export const issueCommand = new Command()
  .description("Manage issues in the repository")
  .action(async () => {
    await runTui(<Issue />);
  });
