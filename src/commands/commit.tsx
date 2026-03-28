import { Command } from "@cliffy/command";
import { runTuiWithRedux } from "../lib/runner.tsx";
import { RouterUI } from "../views/router/ui.tsx";

export async function openCommitTui() {
  await runTuiWithRedux(<RouterUI initialPath="/commit" />);
}

export function createCommitCommand(action: () => Promise<void> = openCommitTui) {
  return new Command()
    .description("Commit changes to the repository")
    .action(action);
}

export const commitCommand = createCommitCommand();
