import { expect, test } from "bun:test";
import {
  buildGeneratedIssueChoices,
  buildIssueTemplateChoices,
  getIssueCreatedText,
  getIssueErrorText,
} from "./ui.tsx";

test("buildIssueTemplateChoices maps templates for Select", () => {
  expect(buildIssueTemplateChoices([{
    name: "Bug Report",
    about: "Report a bug",
    title: "Bug",
    body: "Body",
  }])).toEqual([{
    name: "Bug Report",
    value: {
      name: "Bug Report",
      about: "Report a bug",
      title: "Bug",
      body: "Body",
    },
    description: "Report a bug",
  }]);
});

test("buildGeneratedIssueChoices maps issues for Carousel", () => {
  expect(buildGeneratedIssueChoices([{
    title: "Generated title",
    body: "Generated body",
  }])).toEqual([{
    name: "Generated title",
    value: {
      title: "Generated title",
      body: "Generated body",
    },
    description: "Generated body",
  }]);
});

test("issue UI text helpers format success and error messages", () => {
  expect(getIssueCreatedText("https://example.com")).toBe(
    "Issue created: https://example.com",
  );
  expect(getIssueErrorText("Boom")).toBe("Error: Boom");
});
