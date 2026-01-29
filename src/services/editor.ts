import { envService } from "./config/env.ts";
import { ConfigService } from "./config/index.ts";

export async function editText(text: string): Promise<string> {
  const tempFile = await Deno.makeTempFile({ suffix: ".txt" });

  try {
    await Deno.writeTextFile(tempFile, text);

    const configService = new ConfigService("project", envService);
    const config = await configService.getMerged();
    const [cmd, ...args] = config.editor.split(" ");
    const command = new Deno.Command(cmd, {
      args: [...args, tempFile],
      stdin: "inherit",
      stdout: "inherit",
      stderr: "inherit",
    });

    const { code } = await command.output();

    if (code !== 0) {
      throw new Error("Editor was closed without saving");
    }
    const content = await Deno.readTextFile(tempFile);
    return content;
  } finally {
    await Deno.remove(tempFile);
  }
}
