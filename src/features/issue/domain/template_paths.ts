import { join } from "@std/path";

export async function getIssueTemplatePath(): Promise<
  { markdown: string[]; yaml: string[] }
> {
  const markdownTemplatePath = [];
  const yamlTemplatePath = [];
  const templateDir = join(Deno.cwd(), ".github", "ISSUE_TEMPLATE");
  try {
    for await (const entry of Deno.readDir(templateDir)) {
      if (!entry.isFile) continue;
      if (entry.name === "config.yml" || entry.name === "config.yaml") continue;
      if (entry.name.endsWith(".md")) {
        markdownTemplatePath.push(join(templateDir, entry.name));
      }
      if (entry.name.endsWith(".yml") || entry.name.endsWith(".yaml")) {
        yamlTemplatePath.push(join(templateDir, entry.name));
      }
    }
  } catch (_) {
    // console.error(`Error reading template directory: ${error}`);
  }
  return { markdown: markdownTemplatePath, yaml: yamlTemplatePath };
}
