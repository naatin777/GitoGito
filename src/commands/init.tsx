import { Command } from "@cliffy/command";

export const initCommand = new Command()
  .description("Initialize a new project")
  .option("--local", "Set local settings.")
  .option("--global", "Set global settings.")
  .action(() => {
    console.log("init");
    // const configService = ConfigService.createFromFlags(parsed, envService);
    // const config = await configService.getMerged();
    // if (config) {
    //   console.error("Config already exists");
    //   return;
    // }
    // await runTui(React.createElement(SetupFlow));
  });
