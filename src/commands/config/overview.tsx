import { Command } from "@cliffy/command";

export const overviewCommand = new Command()
  .description("Configure the overview")
  .option("--project", "Set project settings.", {
    conflicts: ["local", "global"],
  })
  .option("--local", "Set local settings.", {
    conflicts: ["project", "global"],
  })
  .option("--global", "Set global settings.", {
    conflicts: ["project", "local"],
  })
  .action(async () => {
    // runTui(
    //   React.createElement(OverviewInput, {
    //     onSubmit: async (overview: string) => {
    //       const configService = ConfigService.createFromFlags(
    //         parsed,
    //         envService,
    //       );
    //       const localConfig = await configService.getMerged();
    //       localConfig.overview = overview;
    //       await configService.save(localConfig);
    //     },
    //   }),
    // );
  });
