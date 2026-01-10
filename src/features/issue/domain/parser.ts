import { stringify } from "@std/yaml";
import type { Issue, IssueTemplate } from "../../../type.ts";
import { extract } from "@std/front-matter/yaml";

export function parseMarkdownIssueTemplate(
  markdown: string,
): IssueTemplate {
  const { attrs, body } = extract<IssueTemplate>(markdown);
  return {
    title: attrs.title,
    body: body.trim(),
    name: attrs.name,
    about: attrs.about,
  };
}

export function stringifyMarkdownIssue(
  issue: Issue,
): string {
  const yamlBlock = stringify({
    title: issue.title,
  });
  return `---
${yamlBlock}---

${issue.body.trim()}
`;
}
