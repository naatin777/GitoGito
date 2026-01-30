import { Command } from "@cliffy/command";

export const languageCommand = new Command()
  .description("Configure the language")
  .option("--local", "Set local settings.")
  .option("--global", "Set global settings.")
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
