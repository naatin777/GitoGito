import { Command } from "@cliffy/command";

export const editorCommand = new Command()
  .description("Configure the editor")
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
    // await runTui(
    //   React.createElement(EditorSelector, {
    //     onSelect: async (editor: string) => {
    //       const configService = ConfigService.createFromFlags(
    //         parsed,
    //         envService,
    //       );
    //       const localConfig = await configService.getMerged();
    //       localConfig.editor = editor;
    //       await configService.save(localConfig);
    //     },
    //   }),
    // );
  });
