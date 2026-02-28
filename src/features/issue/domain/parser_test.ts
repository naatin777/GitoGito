import { expect, test } from "bun:test";

const assertEquals = (actual: unknown, expected: unknown) => {
  expect(actual).toEqual(expected);
};
import {
  parseMarkdownIssueTemplate,
  stringifyMarkdownIssue,
} from "./parser.ts";

test("parseMarkdownIssueTemplate", () => {
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

test("stringifyMarkdownIssue", () => {
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
