import { Command } from "@cliffy/command";
import { runTuiWithRedux } from "../lib/runner.tsx";
import { RouterUI } from "../views/router/ui.tsx";

export async function openHomeTui() {
  await runTuiWithRedux(<RouterUI initialPath="/" />);
}

export function createTuiCommand(action: () => Promise<void> = openHomeTui) {
  return new Command()
    .description("Open interactive TUI home")
    .action(action);
}

export const tuiCommand = createTuiCommand();
