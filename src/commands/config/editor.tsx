import { Command } from "@cliffy/command";

export const editorCommand = new Command()
  .description("Configure the editor")
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
