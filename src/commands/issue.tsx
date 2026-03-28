import { Command } from "@cliffy/command";
import { runTuiWithRedux } from "../lib/runner.tsx";
import { RouterUI } from "../views/router/ui.tsx";

export async function openIssueTui() {
  await runTuiWithRedux(<RouterUI initialPath="/issue" />);
}

export function createIssueCommand(action: () => Promise<void> = openIssueTui) {
  return new Command()
    .description("Manage issues in the repository")
    .action(action);
}

export const issueCommand = createIssueCommand();
