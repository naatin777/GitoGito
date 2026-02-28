import { Command } from "@cliffy/command";
import { runTuiWithRedux } from "../lib/runner.tsx";
import { RouterUI } from "../views/router/ui.tsx";

export const commitCommand = new Command()
  .description("Commit changes to the repository")
  .action(async () => {
    await runTuiWithRedux(<RouterUI initialPath="/commit" />);
  });
