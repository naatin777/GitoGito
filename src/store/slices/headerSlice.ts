/**
 * Header slice: commit message header with autocomplete suggestions and decorators
 */

import type { PayloadAction } from "@reduxjs/toolkit";
import {
  deleteChar,
  moveCursorLeft,
  moveCursorRight,
  moveCursorToEnd,
  moveCursorToStart,
  typeChar,
} from "../../helpers/redux/text-field-reducers.ts";
import type { EditCommitMessageState } from "./editCommitMessageTypes.ts";
import {
  getCompletionSuggestions,
  parseCommitHeader,
} from "../../features/commit/domain/commit-header-completion.ts";
import {
  applyDecorators,
  type CommitDecoratorContext,
} from "../../features/commit/domain/commit-decorator.ts";
import {
  COMMIT_MESSAGE_PREFIXL,
  COMMIT_MESSAGE_SCOPES,
} from "../../constants/commit-message/prefix.ts";

/**
 * Updates filtered suggestions based on current header value and context
 * Uses getCompletionSuggestions to provide context-aware suggestions:
 * - Type suggestions when typing commit type
 * - Suffix suggestions (:, !:, (scope):) after complete type
 * - Scope suggestions when in scope editing mode
 */
function updateFilteredSuggestions(state: EditCommitMessageState): void {
  const completions = getCompletionSuggestions(
    state.header.value,
    state.header.cursor,
    COMMIT_MESSAGE_PREFIXL,
    COMMIT_MESSAGE_SCOPES,
  );

  // Update filtered suggestions with context-aware completions
  state.header.filteredSuggestion = completions.list.map((c) => ({
    value: c.value,
    description: c.description,
  }));
}

/**
 * Apply decorators to header based on current state
 */
function updateDecorators(state: EditCommitMessageState): void {
  // Parse the commit header to extract type, scope, etc.
  const parsed = parseCommitHeader(
    state.header.value,
    state.header.cursor,
  );

  // Create decorator context
  const context: CommitDecoratorContext = {
    headerText: state.header.value,
    type: parsed.type,
    scope: parsed.scope,
    hasBreakingChange: parsed.hasBreakingChange,
    description: parsed.currentToken,
    flags: state.form.flags,
    cursorPosition: state.header.cursor,
  };

  // Apply all registered decorators
  const decorated = applyDecorators(context);
  state.header.decorated = decorated;
}

export const headerSlice = {
  headerType: (
    state: EditCommitMessageState,
    action: PayloadAction<{ char: string }>,
  ) => {
    const { char } = action.payload;
    typeChar(state.header, char);
    updateFilteredSuggestions(state);
    updateDecorators(state);
  },

  headerDelete: (state: EditCommitMessageState) => {
    deleteChar(state.header);
    updateFilteredSuggestions(state);
    updateDecorators(state);
  },

  headerCursorLeft: (state: EditCommitMessageState) => {
    moveCursorLeft(state.header);
  },

  headerCursorRight: (state: EditCommitMessageState) => {
    moveCursorRight(state.header);
  },

  headerGoToStart: (state: EditCommitMessageState) => {
    moveCursorToStart(state.header);
  },

  headerGoToEnd: (state: EditCommitMessageState) => {
    moveCursorToEnd(state.header);
  },

  headerSuggestionNext: (state: EditCommitMessageState) => {
    state.header.suggestionIndex = state.header.suggestionIndex === undefined
      ? 0
      : (state.header.suggestionIndex + 1) %
        state.header.filteredSuggestion.length;
  },

  headerSuggestionPrev: (state: EditCommitMessageState) => {
    state.header.suggestionIndex = state.header.suggestionIndex === undefined
      ? undefined
      : (state.header.suggestionIndex - 1 +
        state.header.filteredSuggestion.length) %
        state.header.filteredSuggestion.length;
  },

  headerSuggestionAccept: (state: EditCommitMessageState) => {
    if (state.header.suggestionIndex !== undefined) {
      const suggestion =
        state.header.filteredSuggestion[state.header.suggestionIndex];
      state.header.value = suggestion.value;
      state.header.cursor = suggestion.value.length;
      state.header.suggestionIndex = undefined;
      updateDecorators(state);
    }
  },

  headerSuggestionCancel: (state: EditCommitMessageState) => {
    state.header.suggestionIndex = undefined;
  },
};
