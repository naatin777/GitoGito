import { assertEquals } from "@std/assert";
import {
  parseMarkdownIssueTemplate,
  stringifyMarkdownIssue,
} from "./parser.ts";

Deno.test("parseMarkdownIssueTemplate", () => {
  const markdown = `---
title: My Issue Template
name: my-issue-template
about: This is my issue template
label: bug
---

This is the body of my issue template.
`;

  const template = parseMarkdownIssueTemplate(markdown);
  assertEquals(template.title, "My Issue Template");
  assertEquals(template.name, "my-issue-template");
  assertEquals(template.about, "This is my issue template");
  assertEquals(template.body, "This is the body of my issue template.");
});

Deno.test("stringifyMarkdownIssue", () => {
  const issue = {
    title: "My Issue Template",
    name: "my-issue-template",
    about: "This is my issue template",
    body: "This is the body of my issue template.",
  };

  const markdown = stringifyMarkdownIssue(issue);
  assertEquals(
    markdown,
    `---
title: My Issue Template
---

This is the body of my issue template.
`,
  );
});
