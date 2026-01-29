import { assertEquals } from "@std/assert";
import {
  filterSuggestions,
  getCompletionSuggestions,
  getSuggestedSuffixes,
  parseCommitHeader,
} from "./commit_header_completion.ts";

Deno.test("parseCommitHeader - type position", () => {
  const result = parseCommitHeader("fix", 3);

  assertEquals(result.position, "type");
  assertEquals(result.currentToken, "fix");
  assertEquals(result.type, "fix");
  assertEquals(result.scope, "");
  assertEquals(result.hasBreakingChange, false);
  assertEquals(result.hasColon, false);
});

Deno.test("parseCommitHeader - type position with partial input", () => {
  const result = parseCommitHeader("f", 1);

  assertEquals(result.position, "type");
  assertEquals(result.currentToken, "f");
  assertEquals(result.type, "f");
});

Deno.test("parseCommitHeader - type position with breaking change", () => {
  const result = parseCommitHeader("fix!", 4);

  assertEquals(result.position, "type");
  assertEquals(result.currentToken, "fix");
  assertEquals(result.type, "fix");
  assertEquals(result.hasBreakingChange, true);
});

Deno.test("parseCommitHeader - scope position", () => {
  const result = parseCommitHeader("fix(auth", 8);

  assertEquals(result.position, "scope");
  assertEquals(result.currentToken, "auth");
  assertEquals(result.type, "fix");
  assertEquals(result.scope, "auth");
  assertEquals(result.hasBreakingChange, false);
});

Deno.test("parseCommitHeader - scope position with breaking change", () => {
  const result = parseCommitHeader("fix!(auth", 9);

  assertEquals(result.position, "scope");
  assertEquals(result.currentToken, "auth");
  assertEquals(result.type, "fix");
  assertEquals(result.scope, "auth");
  assertEquals(result.hasBreakingChange, true);
});

Deno.test("parseCommitHeader - description position", () => {
  const result = parseCommitHeader("fix: add authentication", 23);

  assertEquals(result.position, "description");
  assertEquals(result.currentToken, "add authentication");
  assertEquals(result.type, "fix");
  assertEquals(result.scope, "");
  assertEquals(result.hasColon, true);
});

Deno.test("parseCommitHeader - description position with scope", () => {
  const result = parseCommitHeader("fix(auth): add login", 20);

  assertEquals(result.position, "description");
  assertEquals(result.currentToken, "add login");
  assertEquals(result.type, "fix");
  assertEquals(result.scope, "auth");
  assertEquals(result.hasColon, true);
});

Deno.test("getSuggestedSuffixes - for type", () => {
  const context = parseCommitHeader("fix", 3);
  const suffixes = getSuggestedSuffixes(context);

  // Without available scopes, should only suggest colon variants
  assertEquals(suffixes.length, 2);
  assertEquals(suffixes[0].value, "fix:");
  assertEquals(suffixes[0].description, "No scope");
  assertEquals(suffixes[1].value, "fix!:");
  assertEquals(suffixes[1].description, "Breaking change");
});

Deno.test("getSuggestedSuffixes - for scope", () => {
  const context = parseCommitHeader("fix(auth", 8);
  const suffixes = getSuggestedSuffixes(context);

  assertEquals(suffixes.length, 1);
  assertEquals(suffixes[0].value, "fix(auth):");
  assertEquals(suffixes[0].description, "Close scope");
});

Deno.test("filterSuggestions - filters by prefix", () => {
  const suggestions = [
    { value: "fix", description: "A bug fix" },
    { value: "feat", description: "A new feature" },
    { value: "docs", description: "Documentation" },
  ];

  const filtered = filterSuggestions(suggestions, "f");

  assertEquals(filtered.length, 2);
  assertEquals(filtered[0].value, "fix");
  assertEquals(filtered[1].value, "feat");
});

Deno.test("filterSuggestions - no filter returns all", () => {
  const suggestions = [
    { value: "fix", description: "A bug fix" },
    { value: "feat", description: "A new feature" },
  ];

  const filtered = filterSuggestions(suggestions, "");

  assertEquals(filtered.length, 2);
});

Deno.test("getCompletionSuggestions - type suggestions", () => {
  const types = [
    { value: "fix", description: "A bug fix" },
    { value: "feat", description: "A new feature" },
  ];
  const scopes: Array<{ value: string; description: string }> = [];

  const result = getCompletionSuggestions("f", 1, types, scopes);

  assertEquals(result.list.length, 2);
  assertEquals(result.list[0].value, "fix");
  assertEquals(result.list[0].inlineCompletion, "ix");
  assertEquals(result.list[1].value, "feat");
  assertEquals(result.list[1].inlineCompletion, "eat");
  assertEquals(result.inline?.value, "fix");
  assertEquals(result.inline?.inlineCompletion, "ix");
});

Deno.test("getCompletionSuggestions - type with suffix suggestions", () => {
  const types = [
    { value: "fix", description: "A bug fix" },
  ];
  const scopes: Array<{ value: string; description: string }> = [];

  const result = getCompletionSuggestions("fix", 3, types, scopes);

  // Should include both the type match and suffix suggestions
  assertEquals(result.list.length > 1, true);
  const colonSuggestion = result.list.find((s) => s.value === "fix:");
  assertEquals(colonSuggestion !== undefined, true);
});

Deno.test("getCompletionSuggestions - scope suggestions", () => {
  const types = [
    { value: "fix", description: "A bug fix" },
  ];
  const scopes = [
    { value: "auth", description: "Authentication" },
    { value: "api", description: "API" },
  ];

  const result = getCompletionSuggestions("fix(a", 5, types, scopes);

  assertEquals(result.list.length >= 2, true);
  const authSuggestion = result.list.find((s) => s.value === "fix(auth):");
  assertEquals(authSuggestion !== undefined, true);
  assertEquals(authSuggestion?.inlineCompletion, "uth):");
});

Deno.test("getCompletionSuggestions - description (no suggestions)", () => {
  const types = [
    { value: "fix", description: "A bug fix" },
  ];
  const scopes: Array<{ value: string; description: string }> = [];

  const result = getCompletionSuggestions("fix: add ", 9, types, scopes);

  assertEquals(result.inline, null);
  assertEquals(result.list.length, 0);
});

Deno.test("parseCommitHeader - after closed scope before colon", () => {
  const result = parseCommitHeader("style(src):", 10);

  assertEquals(result.position, "description");
  assertEquals(result.type, "style");
  assertEquals(result.scope, "src");
});

Deno.test("getCompletionSuggestions - after complete type with scope and colon", () => {
  const types = [
    { value: "style", description: "Code style changes" },
  ];
  const scopes = [
    { value: "src", description: "Source code" },
  ];

  const result = getCompletionSuggestions("style(src):", 11, types, scopes);

  // After colon, no suggestions should be shown
  assertEquals(result.inline, null);
  assertEquals(result.list.length, 0);
});
