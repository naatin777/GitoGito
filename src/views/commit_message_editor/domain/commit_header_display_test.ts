import { assertEquals } from "@std/assert";
import type { CompletionSuggestion } from "./commit_header_completion.ts";
import {
  formatCharacterCount,
  formatDropdownItems,
  formatDropdownItemText,
  formatGhostText,
  formatHeaderWithGhostText,
} from "./commit_header_display.ts";

Deno.test("formatGhostText - with valid suggestion", () => {
  const suggestion: CompletionSuggestion = {
    value: "fix",
    inlineCompletion: "ix",
    description: "A bug fix",
  };

  const result = formatGhostText(suggestion);

  assertEquals(result, {
    text: "ix",
    visible: true,
  });
});

Deno.test("formatGhostText - with null suggestion", () => {
  const result = formatGhostText(null);

  assertEquals(result, {
    text: "",
    visible: false,
  });
});

Deno.test("formatGhostText - with empty inline completion", () => {
  const suggestion: CompletionSuggestion = {
    value: "fix",
    inlineCompletion: "",
    description: "A bug fix",
  };

  const result = formatGhostText(suggestion);

  assertEquals(result, {
    text: "",
    visible: false,
  });
});

Deno.test("formatDropdownItems - with selected index", () => {
  const suggestions: CompletionSuggestion[] = [
    { value: "fix", inlineCompletion: "ix", description: "A bug fix" },
    { value: "feat", inlineCompletion: "eat", description: "A new feature" },
    { value: "docs", inlineCompletion: "ocs", description: "Documentation" },
  ];

  const result = formatDropdownItems(suggestions, 1);

  assertEquals(result, [
    { value: "fix", description: "A bug fix", selected: false },
    { value: "feat", description: "A new feature", selected: true },
    { value: "docs", description: "Documentation", selected: false },
  ]);
});

Deno.test("formatDropdownItems - without selected index", () => {
  const suggestions: CompletionSuggestion[] = [
    { value: "fix", inlineCompletion: "ix", description: "A bug fix" },
    { value: "feat", inlineCompletion: "eat", description: "A new feature" },
  ];

  const result = formatDropdownItems(suggestions, undefined);

  assertEquals(result, [
    { value: "fix", description: "A bug fix", selected: false },
    { value: "feat", description: "A new feature", selected: false },
  ]);
});

Deno.test("formatDropdownItems - empty list", () => {
  const result = formatDropdownItems([], undefined);
  assertEquals(result, []);
});

Deno.test("formatCharacterCount - under limit", () => {
  const result = formatCharacterCount("fix: add login", 50);

  assertEquals(result, {
    current: 14,
    max: 50,
    text: "14/50",
    isOverLimit: false,
  });
});

Deno.test("formatCharacterCount - over limit", () => {
  const longText =
    "fix: add very very very long description that exceeds limit";
  const result = formatCharacterCount(longText, 50);

  assertEquals(result.max, 50);
  assertEquals(result.isOverLimit, true);
  assertEquals(result.current > 50, true);
});

Deno.test("formatCharacterCount - exactly at limit", () => {
  const text = "fix: add feature with exactly fifty characters!";
  const result = formatCharacterCount(text, 50);

  assertEquals(result.current, 47);
  assertEquals(result.max, 50);
  assertEquals(result.isOverLimit, false);
});

Deno.test("formatCharacterCount - with unicode characters", () => {
  // Japanese characters are typically 2 columns wide
  const result = formatCharacterCount("fix: 日本語", 50);

  // "fix: " = 5, "日本語" = 6 (3 chars * 2 width each)
  assertEquals(result.current, 11);
  assertEquals(result.max, 50);
  assertEquals(result.text, "11/50");
  assertEquals(result.isOverLimit, false);
});

Deno.test("formatCharacterCount - empty text", () => {
  const result = formatCharacterCount("", 50);

  assertEquals(result, {
    current: 0,
    max: 50,
    text: "0/50",
    isOverLimit: false,
  });
});

Deno.test("formatDropdownItemText - basic item", () => {
  const item = {
    value: "fix",
    description: "A bug fix",
    selected: false,
  };

  const result = formatDropdownItemText(item);
  assertEquals(result, "→ fix - A bug fix");
});

Deno.test("formatDropdownItemText - selected item", () => {
  const item = {
    value: "feat",
    description: "A new feature",
    selected: true,
  };

  const result = formatDropdownItemText(item);
  assertEquals(result, "→ feat - A new feature");
});

Deno.test("formatDropdownItemText - with long description", () => {
  const item = {
    value: "refactor",
    description: "Code refactoring without changing functionality",
    selected: false,
  };

  const result = formatDropdownItemText(item);
  assertEquals(
    result,
    "→ refactor - Code refactoring without changing functionality",
  );
});

Deno.test("formatHeaderWithGhostText - with visible ghost text", () => {
  const result = formatHeaderWithGhostText("f", {
    text: "ix",
    visible: true,
  });

  assertEquals(result, {
    userPart: "f",
    ghostPart: "ix",
  });
});

Deno.test("formatHeaderWithGhostText - with invisible ghost text", () => {
  const result = formatHeaderWithGhostText("fix", {
    text: "",
    visible: false,
  });

  assertEquals(result, {
    userPart: "fix",
    ghostPart: "",
  });
});

Deno.test("formatHeaderWithGhostText - empty user input", () => {
  const result = formatHeaderWithGhostText("", {
    text: "fix",
    visible: true,
  });

  assertEquals(result, {
    userPart: "",
    ghostPart: "fix",
  });
});
