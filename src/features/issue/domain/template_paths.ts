import { readdir } from "node:fs/promises";
import { join } from "node:path";

export async function getIssueTemplatePath(): Promise<
  { markdown: string[]; yaml: string[] }
> {
  const markdownTemplatePath = [];
  const yamlTemplatePath = [];
  const templateDir = join(process.cwd(), ".github", "ISSUE_TEMPLATE");
  try {
    const entries = await readdir(templateDir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isFile()) continue;
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
