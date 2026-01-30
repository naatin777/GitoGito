import { Command } from "@cliffy/command";
import React from "react";
import { Commit } from "../features/commit/ui.tsx";
import { runTui } from "../lib/tui.ts";

export const commitCommand = new Command()
  .description("Commit changes to the repository")
  .action(async () => {
    const commit = React.createElement(Commit, null);
    await runTui(commit);
  });
