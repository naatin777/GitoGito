import { Command } from "@cliffy/command";

export const languageCommand = new Command()
  .description("Configure the language")
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
    //   React.createElement(LanguageSelector, {
    //     onSelect: async (language: string) => {
    //       const configService = ConfigService.createFromFlags(
    //         parsed,
    //         envService,
    //       );
    //       const localConfig = await configService.getMerged();
    //       localConfig.language = language;
    //       await configService.save(localConfig);
    //     },
    //   }),
    // );
  });
