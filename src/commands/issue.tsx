import { Command } from "@cliffy/command";
import { runTuiWithRedux } from "../lib/runner.tsx";
import { RouterUI } from "../views/router/ui.tsx";

export const issueCommand = new Command()
  .description("Manage issues in the repository")
  .action(async () => {
    await runTuiWithRedux(<RouterUI initialPath="/issue" />);
  });
