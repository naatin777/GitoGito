/**
 * Tests for commit selectors
 * Demonstrates memoization and selector composition
 */

import { assertEquals } from "@std/assert";
import type { EditCommitMessageState } from "../../store/slices/editCommitMessageTypes.ts";
import {
  type CommitSelectorState,
  selectAbsoluteCursor,
  selectCommitFlags,
  selectFullCommitMessage,
  selectHasDecorations,
  selectHasSuggestions,
  selectHeaderDisplayText,
  selectHeaderFullText,
  selectHeaderValue,
  selectIsAiMode,
  selectIsBodyEditable,
  selectIsBodyEmpty,
  selectIsBodyFocused,
  selectIsCommitMessageValid,
  selectIsFooterEditable,
  selectIsFooterEmpty,
  selectIsFooterFocused,
  selectIsHeaderEditable,
  selectIsHeaderFocused,
  selectIsNormalMode,
  selectIsSuggestionSelected,
  selectMode,
  selectSelectedSuggestion,
} from "./commitSelectors.ts";

/**
 * Helper to create mock state for testing
 * Uses CommitSelectorState type exported from selectors
 * This avoids circular dependency with store/index.ts
 * @param overrides - Partial state to override defaults
 * @returns Test state object
 */
function createMockState(
  overrides: Partial<EditCommitMessageState> = {},
): CommitSelectorState {
  return {
    editCommitMessage: {
      form: {
        mode: "normal",
        focus: "header",
        flags: {},
      },
      header: {
        value: "fix: bug",
        cursor: 8,
        suggestion: [],
        filteredSuggestion: [],
        suggestionIndex: undefined,
        decorated: null,
      },
      body: {
        value: "",
        cursor: 0,
      },
      footer: {
        value: "",
        cursor: 0,
      },
      ...overrides,
    },
  };
}

Deno.test("selectMode - returns current mode", () => {
  const state = createMockState({
    form: { mode: "ai", focus: "header", flags: {} },
  });
  assertEquals(selectMode(state), "ai");
});

Deno.test("selectIsAiMode - returns true when in AI mode", () => {
  const state = createMockState({
    form: { mode: "ai", focus: "header", flags: {} },
  });
  assertEquals(selectIsAiMode(state), true);
});

Deno.test("selectIsNormalMode - returns true when in normal mode", () => {
  const state = createMockState({
    form: { mode: "normal", focus: "header", flags: {} },
  });
  assertEquals(selectIsNormalMode(state), true);
});

Deno.test("selectIsHeaderFocused - returns true when header is focused", () => {
  const state = createMockState({
    form: { mode: "normal", focus: "header", flags: {} },
  });
  assertEquals(selectIsHeaderFocused(state), true);
});

Deno.test("selectIsBodyFocused - returns true when body is focused", () => {
  const state = createMockState({
    form: { mode: "normal", focus: "body", flags: {} },
  });
  assertEquals(selectIsBodyFocused(state), true);
});

Deno.test("selectIsFooterFocused - returns true when footer is focused", () => {
  const state = createMockState({
    form: { mode: "normal", focus: "footer", flags: {} },
  });
  assertEquals(selectIsFooterFocused(state), true);
});

Deno.test("selectHeaderValue - returns header value", () => {
  const state = createMockState();
  assertEquals(selectHeaderValue(state), "fix: bug");
});

Deno.test("selectHeaderFullText - returns plain text when no decorations", () => {
  const state = createMockState();
  assertEquals(selectHeaderFullText(state), "fix: bug");
});

Deno.test("selectHeaderFullText - returns decorated full text when decorated", () => {
  const state = createMockState({
    header: {
      value: "fix: bug",
      cursor: 8,
      suggestion: [],
      filteredSuggestion: [],
      suggestionIndex: undefined,
      decorated: {
        prefixes: ["WIP: "],
        userText: "fix: bug",
        suffixes: [],
        fullText: "WIP: fix: bug",
        decorationRanges: [],
      },
    },
  });
  assertEquals(selectHeaderFullText(state), "WIP: fix: bug");
});

Deno.test("selectHasDecorations - returns false when no decorations", () => {
  const state = createMockState();
  assertEquals(selectHasDecorations(state), false);
});

Deno.test("selectHasDecorations - returns true when decorated", () => {
  const state = createMockState({
    header: {
      value: "fix: bug",
      cursor: 8,
      suggestion: [],
      filteredSuggestion: [],
      suggestionIndex: undefined,
      decorated: {
        prefixes: ["WIP: "],
        userText: "fix: bug",
        suffixes: [],
        fullText: "WIP: fix: bug",
        decorationRanges: [],
      },
    },
  });
  assertEquals(selectHasDecorations(state), true);
});

Deno.test("selectAbsoluteCursor - returns cursor position without decorations", () => {
  const state = createMockState();
  assertEquals(selectAbsoluteCursor(state), 8);
});

Deno.test("selectAbsoluteCursor - returns absolute cursor with decorations", () => {
  const state = createMockState({
    header: {
      value: "fix: bug",
      cursor: 8,
      suggestion: [],
      filteredSuggestion: [],
      suggestionIndex: undefined,
      decorated: {
        prefixes: ["WIP: "],
        userText: "fix: bug",
        suffixes: [],
        fullText: "WIP: fix: bug",
        decorationRanges: [],
      },
    },
  });
  // "WIP: " is 5 characters, cursor at 8 → absolute position 13
  assertEquals(selectAbsoluteCursor(state), 13);
});

Deno.test("selectHasSuggestions - returns false when no suggestions", () => {
  const state = createMockState();
  assertEquals(selectHasSuggestions(state), false);
});

Deno.test("selectHasSuggestions - returns true when suggestions exist", () => {
  const state = createMockState({
    header: {
      value: "f",
      cursor: 1,
      suggestion: [],
      filteredSuggestion: [
        { value: "fix", description: "A bug fix" },
        { value: "feat", description: "A new feature" },
      ],
      suggestionIndex: undefined,
      decorated: null,
    },
  });
  assertEquals(selectHasSuggestions(state), true);
});

Deno.test("selectIsSuggestionSelected - returns false when no selection", () => {
  const state = createMockState();
  assertEquals(selectIsSuggestionSelected(state), false);
});

Deno.test("selectIsSuggestionSelected - returns true when suggestion selected", () => {
  const state = createMockState({
    header: {
      value: "f",
      cursor: 1,
      suggestion: [],
      filteredSuggestion: [
        { value: "fix", description: "A bug fix" },
      ],
      suggestionIndex: 0,
      decorated: null,
    },
  });
  assertEquals(selectIsSuggestionSelected(state), true);
});

Deno.test("selectSelectedSuggestion - returns null when no selection", () => {
  const state = createMockState();
  assertEquals(selectSelectedSuggestion(state), null);
});

Deno.test("selectSelectedSuggestion - returns selected suggestion", () => {
  const state = createMockState({
    header: {
      value: "f",
      cursor: 1,
      suggestion: [],
      filteredSuggestion: [
        { value: "fix", description: "A bug fix" },
        { value: "feat", description: "A new feature" },
      ],
      suggestionIndex: 1,
      decorated: null,
    },
  });
  assertEquals(selectSelectedSuggestion(state), {
    value: "feat",
    description: "A new feature",
  });
});

Deno.test("selectIsBodyEmpty - returns true when body is empty", () => {
  const state = createMockState();
  assertEquals(selectIsBodyEmpty(state), true);
});

Deno.test("selectIsBodyEmpty - returns false when body has content", () => {
  const state = createMockState({
    body: {
      value: "This is the body",
      cursor: 0,
    },
  });
  assertEquals(selectIsBodyEmpty(state), false);
});

Deno.test("selectIsFooterEmpty - returns true when footer is empty", () => {
  const state = createMockState();
  assertEquals(selectIsFooterEmpty(state), true);
});

Deno.test("selectFullCommitMessage - combines header, body, and footer", () => {
  const state = createMockState({
    header: {
      value: "fix: bug",
      cursor: 8,
      suggestion: [],
      filteredSuggestion: [],
      suggestionIndex: undefined,
      decorated: null,
    },
    body: {
      value: "This is the body",
      cursor: 0,
    },
    footer: {
      value: "Closes #123",
      cursor: 0,
    },
  });

  assertEquals(
    selectFullCommitMessage(state),
    "fix: bug\n\nThis is the body\n\nCloses #123",
  );
});

Deno.test("selectFullCommitMessage - only header when body and footer are empty", () => {
  const state = createMockState();
  assertEquals(selectFullCommitMessage(state), "fix: bug");
});

Deno.test("selectIsCommitMessageValid - returns true when header has content", () => {
  const state = createMockState();
  assertEquals(selectIsCommitMessageValid(state), true);
});

Deno.test("selectIsCommitMessageValid - returns false when header is empty", () => {
  const state = createMockState({
    header: {
      value: "   ",
      cursor: 0,
      suggestion: [],
      filteredSuggestion: [],
      suggestionIndex: undefined,
      decorated: null,
    },
  });
  assertEquals(selectIsCommitMessageValid(state), false);
});

Deno.test("selectIsHeaderEditable - returns true when header focused and normal mode", () => {
  const state = createMockState({
    form: { mode: "normal", focus: "header", flags: {} },
  });
  assertEquals(selectIsHeaderEditable(state), true);
});

Deno.test("selectIsHeaderEditable - returns false when in AI mode", () => {
  const state = createMockState({
    form: { mode: "ai", focus: "header", flags: {} },
  });
  assertEquals(selectIsHeaderEditable(state), false);
});

Deno.test("selectIsBodyEditable - returns true when body focused and normal mode", () => {
  const state = createMockState({
    form: { mode: "normal", focus: "body", flags: {} },
  });
  assertEquals(selectIsBodyEditable(state), true);
});

Deno.test("selectIsFooterEditable - returns true when footer focused and normal mode", () => {
  const state = createMockState({
    form: { mode: "normal", focus: "footer", flags: {} },
  });
  assertEquals(selectIsFooterEditable(state), true);
});

Deno.test("selectCommitFlags - returns commit flags", () => {
  const state = createMockState({
    form: {
      mode: "normal",
      focus: "header",
      flags: { wip: true, emoji: true },
    },
  });
  assertEquals(selectCommitFlags(state), { wip: true, emoji: true });
});

Deno.test("selectHeaderDisplayText - same as selectHeaderFullText", () => {
  const state = createMockState();
  assertEquals(selectHeaderDisplayText(state), selectHeaderFullText(state));
});
