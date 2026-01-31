import { Command } from "@cliffy/command";
import { Commit } from "../features/commit/ui.tsx";
import { runTuiWithRedux } from "../lib/runner.tsx";

export const commitCommand = new Command()
  .description("Commit changes to the repository")
  .action(async () => {
    await runTuiWithRedux(<Commit />);
  });
