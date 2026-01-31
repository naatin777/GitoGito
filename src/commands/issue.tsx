import { Command } from "@cliffy/command";
import { Issue } from "../features/issue/ui.tsx";
import { runTuiWithRedux } from "../lib/runner.tsx";

export const issueCommand = new Command()
  .description("Manage issues in the repository")
  .action(async () => {
    await runTuiWithRedux(<Issue />);
  });
