/**
 * Commit feature selectors
 * Use memoized selectors to prevent unnecessary re-renders
 */

import { createSelector } from "@reduxjs/toolkit";
import type { EditCommitMessageState } from "../../views/edit_commit_message/types.ts";

// ============================================================================
// Input Selectors (基本的なstate取得)
// ============================================================================

/**
 * State shape required by commit selectors
 * Uses structural typing instead of depending on full RootState
 * This allows testing without circular dependencies
 */
export type CommitSelectorState = {
  editCommitMessage: EditCommitMessageState;
};

/** Select entire editCommitMessage state */
export const selectEditCommitMessage = (state: CommitSelectorState) =>
  state.editCommitMessage;

/** Select form state */
export const selectCommitForm = (state: CommitSelectorState) =>
  state.editCommitMessage.form;

/** Select header state */
export const selectCommitHeader = (state: CommitSelectorState) =>
  state.editCommitMessage.header;

/** Select body state */
export const selectCommitBody = (state: CommitSelectorState) =>
  state.editCommitMessage.body;

/** Select footer state */
export const selectCommitFooter = (state: CommitSelectorState) =>
  state.editCommitMessage.footer;

// ============================================================================
// Form Selectors (メモ化されたフォーム状態)
// ============================================================================

/** Select current mode (normal/ai) */
export const selectMode = createSelector(
  [selectCommitForm],
  (form) => form.mode,
);

/** Select current focus (header/body/footer) */
export const selectFocus = createSelector(
  [selectCommitForm],
  (form) => form.focus,
);

/** Select commit flags */
export const selectCommitFlags = createSelector(
  [selectCommitForm],
  (form) => form.flags,
);

/** Check if specific flag is enabled */
export const makeSelectFlagEnabled = (flagName: string) =>
  createSelector([selectCommitFlags], (flags) => flags[flagName] === true);

/** Check if header is focused */
export const selectIsHeaderFocused = createSelector(
  [selectFocus],
  (focus) => focus === "header",
);

/** Check if body is focused */
export const selectIsBodyFocused = createSelector(
  [selectFocus],
  (focus) => focus === "body",
);

/** Check if footer is focused */
export const selectIsFooterFocused = createSelector(
  [selectFocus],
  (focus) => focus === "footer",
);

/** Check if in AI mode */
export const selectIsAiMode = createSelector(
  [selectMode],
  (mode) => mode === "ai",
);

/** Check if in normal mode */
export const selectIsNormalMode = createSelector(
  [selectMode],
  (mode) => mode === "normal",
);

// ============================================================================
// Header Selectors (メモ化されたヘッダー状態)
// ============================================================================

/** Select header value (user's editable text) */
export const selectHeaderValue = createSelector(
  [selectCommitHeader],
  (header) => header.value,
);

/** Select header cursor position */
export const selectHeaderCursor = createSelector(
  [selectCommitHeader],
  (header) => header.cursor,
);

/** Select decorated message */
export const selectDecoratedMessage = createSelector(
  [selectCommitHeader],
  (header) => header.decorated,
);

/** Select full text (decorated or plain) */
export const selectHeaderFullText = createSelector(
  [selectCommitHeader],
  (header) => {
    if (header.decorated) {
      return header.decorated.fullText;
    }
    return header.value;
  },
);

/** Select display text for rendering */
export const selectHeaderDisplayText = selectHeaderFullText;

/** Select whether decorations are applied */
export const selectHasDecorations = createSelector(
  [selectDecoratedMessage],
  (decorated) => decorated !== null,
);

/** Select prefix text */
export const selectHeaderPrefixes = createSelector(
  [selectDecoratedMessage],
  (decorated) => (decorated ? decorated.prefixes : []),
);

/** Select suffix text */
export const selectHeaderSuffixes = createSelector(
  [selectDecoratedMessage],
  (decorated) => (decorated ? decorated.suffixes : []),
);

/** Calculate absolute cursor position (including prefixes) */
export const selectAbsoluteCursor = createSelector(
  [selectCommitHeader],
  (header) => {
    if (!header.decorated) return header.cursor;

    const prefixLength = header.decorated.prefixes.join("").length;
    return prefixLength + header.cursor;
  },
);

/** Select filtered suggestions */
export const selectFilteredSuggestions = createSelector(
  [selectCommitHeader],
  (header) => header.filteredSuggestion,
);

/** Select current suggestion index */
export const selectSuggestionIndex = createSelector(
  [selectCommitHeader],
  (header) => header.suggestionIndex,
);

/** Check if suggestions are visible */
export const selectHasSuggestions = createSelector(
  [selectFilteredSuggestions],
  (suggestions) => suggestions.length > 0,
);

/** Check if a suggestion is selected */
export const selectIsSuggestionSelected = createSelector(
  [selectSuggestionIndex],
  (index) => index !== undefined,
);

/** Get selected suggestion */
export const selectSelectedSuggestion = createSelector(
  [selectFilteredSuggestions, selectSuggestionIndex],
  (suggestions, index) => {
    if (index === undefined || index >= suggestions.length) {
      return null;
    }
    return suggestions[index];
  },
);

// ============================================================================
// Body Selectors (メモ化されたボディ状態)
// ============================================================================

/** Select body value */
export const selectBodyValue = createSelector(
  [selectCommitBody],
  (body) => body.value,
);

/** Select body cursor position */
export const selectBodyCursor = createSelector(
  [selectCommitBody],
  (body) => body.cursor,
);

/** Check if body is empty */
export const selectIsBodyEmpty = createSelector(
  [selectBodyValue],
  (value) => value.length === 0,
);

// ============================================================================
// Footer Selectors (メモ化されたフッター状態)
// ============================================================================

/** Select footer value */
export const selectFooterValue = createSelector(
  [selectCommitFooter],
  (footer) => footer.value,
);

/** Select footer cursor position */
export const selectFooterCursor = createSelector(
  [selectCommitFooter],
  (footer) => footer.cursor,
);

/** Check if footer is empty */
export const selectIsFooterEmpty = createSelector(
  [selectFooterValue],
  (value) => value.length === 0,
);

// ============================================================================
// Combined Selectors (複数の状態を組み合わせ)
// ============================================================================

/** Get complete commit message (header + body + footer) */
export const selectFullCommitMessage = createSelector(
  [selectHeaderFullText, selectBodyValue, selectFooterValue],
  (header, body, footer) => {
    const parts = [header];

    if (body.length > 0) {
      parts.push("", body); // Empty line between header and body
    }

    if (footer.length > 0) {
      parts.push("", footer); // Empty line between body and footer
    }

    return parts.join("\n");
  },
);

/** Check if commit message is valid (has header) */
export const selectIsCommitMessageValid = createSelector(
  [selectHeaderValue],
  (header) => header.trim().length > 0,
);

/** Check if currently editable (focused and not in AI mode) */
export const selectIsEditable = createSelector(
  [selectMode, selectFocus],
  (mode, focus) => mode === "normal" && focus !== undefined,
);

/** Check if header is editable */
export const selectIsHeaderEditable = createSelector(
  [selectIsHeaderFocused, selectIsNormalMode],
  (isFocused, isNormalMode) => isFocused && isNormalMode,
);

/** Check if body is editable */
export const selectIsBodyEditable = createSelector(
  [selectIsBodyFocused, selectIsNormalMode],
  (isFocused, isNormalMode) => isFocused && isNormalMode,
);

/** Check if footer is editable */
export const selectIsFooterEditable = createSelector(
  [selectIsFooterFocused, selectIsNormalMode],
  (isFocused, isNormalMode) => isFocused && isNormalMode,
);

// ============================================================================
// Parameterized Selector Factories (パラメータ付きセレクター)
// ============================================================================

/**
 * Create a selector to check if cursor is within a specific range
 * @returns Selector function
 */
export const makeSelectCursorInRange = () =>
  createSelector(
    [
      selectHeaderCursor,
      (_state: CommitSelectorState, start: number) => start,
      (_state: CommitSelectorState, _start: number, end: number) => end,
    ],
    (cursor, start, end) => {
      return cursor >= start && cursor <= end;
    },
  );

/**
 * Create a selector to get text at specific field
 * @returns Selector function
 */
export const makeSelectFieldValue = (
  field: "header" | "body" | "footer",
) => {
  switch (field) {
    case "header":
      return selectHeaderValue;
    case "body":
      return selectBodyValue;
    case "footer":
      return selectFooterValue;
  }
};

/**
 * Create a selector to get cursor at specific field
 * @returns Selector function
 */
export const makeSelectFieldCursor = (
  field: "header" | "body" | "footer",
) => {
  switch (field) {
    case "header":
      return selectHeaderCursor;
    case "body":
      return selectBodyCursor;
    case "footer":
      return selectFooterCursor;
  }
};
