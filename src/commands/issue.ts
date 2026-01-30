import { Command } from "@cliffy/command";
import React from "react";
import { Issue } from "../features/issue/ui.tsx";
import { runTui } from "../lib/tui.ts";

export const issueCommand = new Command()
  .description("Manage issues in the repository")
  .action(async () => {
    const issue = React.createElement(Issue, null);
    await runTui(issue);
  });
