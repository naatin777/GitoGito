import { Command } from "@cliffy/command";

export const overviewCommand = new Command()
  .description("Configure the overview")
  .option("--local", "Set local settings.")
  .option("--global", "Set global settings.")
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
