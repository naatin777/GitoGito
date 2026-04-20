import { expect, test } from "bun:test";
import {
  getGeneratedIssuesError,
  getIssueSelectionError,
  getTemplateSelectionError,
  ISSUE_GENERATION_EMPTY_MESSAGE,
  ISSUE_SELECTION_CANCELLED_MESSAGE,
  ISSUE_TEMPLATE_CANCELLED_MESSAGE,
  shouldCloseIssueFlow,
} from "./hook.ts";

test("shouldCloseIssueFlow only closes done and error steps", () => {
  expect(shouldCloseIssueFlow("done")).toBe(true);
  expect(shouldCloseIssueFlow("error")).toBe(true);
  expect(shouldCloseIssueFlow("loading_templates")).toBe(false);
});

test("getTemplateSelectionError returns a cancellation message when missing", () => {
  expect(getTemplateSelectionError(undefined)).toBe(
    ISSUE_TEMPLATE_CANCELLED_MESSAGE,
  );
  expect(getTemplateSelectionError({
    name: "Feature",
    about: "Feature request",
    title: "Title",
    body: "Body",
  })).toBeUndefined();
});

test("getGeneratedIssuesError validates generated issue candidates", () => {
  expect(getGeneratedIssuesError({ issue: [] })).toBe(
    ISSUE_GENERATION_EMPTY_MESSAGE,
  );
  expect(getGeneratedIssuesError({
    issue: [{ title: "Title", body: "Body" }],
  })).toBeUndefined();
});

test("getIssueSelectionError returns a cancellation message when missing", () => {
  expect(getIssueSelectionError(undefined)).toBe(
    ISSUE_SELECTION_CANCELLED_MESSAGE,
  );
  expect(getIssueSelectionError({ title: "Title", body: "Body" })).toBeUndefined();
});
