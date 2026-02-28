import { Command } from "@cliffy/command";
import { runTuiWithRedux } from "../lib/runner.tsx";
import { RouterUI } from "../views/router/ui.tsx";

export const tuiCommand = new Command()
  .description("Open interactive TUI home")
  .action(async () => {
    await runTuiWithRedux(<RouterUI initialPath="/" />);
  });
