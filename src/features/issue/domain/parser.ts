import { YAML } from "bun";
import type { Issue, IssueTemplate } from "../../../type.ts";

export function parseMarkdownIssueTemplate(
  markdown: string,
): IssueTemplate {
  const { attributes, body } = parseFrontMatter(markdown);
  const attrs = attributes as Partial<IssueTemplate>;

  return {
    title: attrs.title ?? "",
    body: body.trim(),
    name: attrs.name ?? "",
    about: attrs.about ?? "",
  };
}

export function stringifyMarkdownIssue(
  issue: Issue,
): string {
  const yamlBlock = YAML.stringify(
    {
      title: issue.title,
    },
    null,
    2,
  ).trimEnd();
  return `---
${yamlBlock}
---

${issue.body.trim()}
`;
}

function parseFrontMatter(markdown: string): {
  attributes: Record<string, unknown>;
  body: string;
} {
  const normalized = markdown.replaceAll("\r\n", "\n");
  const lines = normalized.split("\n");

  if (lines[0] !== "---") {
    return { attributes: {}, body: normalized };
  }

  let endIndex = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i]?.trim() === "---") {
      endIndex = i;
      break;
    }
  }

  if (endIndex < 0) {
    return { attributes: {}, body: normalized };
  }

  const yamlText = lines.slice(1, endIndex).join("\n");
  const body = lines.slice(endIndex + 1).join("\n");
  const parsed = YAML.parse(yamlText);
  const attributes = (parsed ?? {}) as Record<string, unknown>;

  return { attributes, body };
}
