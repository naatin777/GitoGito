import { expect, test } from "bun:test";
import { createIssue, editIssue, issueReducer, loadTemplates, setError } from "./issue_slice.ts";

test("setError stores the provided message", () => {
  const state = issueReducer(undefined, setError("Issue selection was cancelled."));

  expect(state).toEqual({
    step: "error",
    message: "Issue selection was cancelled.",
  });
});

test("loadTemplates.rejected stores the rejected message", () => {
  const state = issueReducer(
    undefined,
    loadTemplates.rejected(null, "request-id", undefined, "No templates found"),
  );

  expect(state).toEqual({
    step: "error",
    message: "No templates found",
  });
});

test("editIssue.rejected falls back to a default message", () => {
  const state = issueReducer(
    undefined,
    editIssue.rejected(null, "request-id", {
      title: "title",
      body: "body",
    }),
  );

  expect(state).toEqual({
    step: "error",
    message: "Failed to edit the issue draft.",
  });
});

test("createIssue.rejected falls back to a default message", () => {
  const state = issueReducer(
    undefined,
    createIssue.rejected(null, "request-id", {
      title: "title",
      body: "body",
    }),
  );

  expect(state).toEqual({
    step: "error",
    message: "Failed to create the issue.",
  });
});
