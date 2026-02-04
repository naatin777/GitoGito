import { Command } from "@cliffy/command";

export const issueCommand = new Command()
  .description("Manage issues in the repository")
  .action(() => {
    console.log("issue");
    // await runTuiWithRedux(<Issue />);
  });
