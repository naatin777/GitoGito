import { Command } from "@cliffy/command";
import { runTuiWithRedux } from "../lib/runner.tsx";
import { Commit } from "../features/commit/ui.tsx";

export const commitCommand = new Command()
  .description("Commit changes to the repository")
  .action(async () => {
    await runTuiWithRedux(<Commit />);
  });
