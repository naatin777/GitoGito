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
} from "../../helpers/redux/text_field_reducers.ts";
import type { EditCommitMessageState } from "./types.ts";
import {
  getCompletionSuggestions,
  parseCommitHeader,
} from "../../features/commit/domain/commit_header_completion.ts";
import {
  applyDecorators,
  type CommitDecoratorContext,
} from "../../features/commit/domain/commit_decorator.ts";
import {
  COMMIT_MESSAGE_PREFIXL,
  COMMIT_MESSAGE_SCOPES,
} from "../../constants/commit_message/prefix.ts";

/**
 * Maximum number of suggestions visible at once
 * Users can scroll through more suggestions using Tab/Shift+Tab
 */
const SUGGESTION_VISIBLE_COUNT = 5;

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

  // Reset scroll offset when suggestions change
  state.header.suggestionScrollOffset = 0;
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
    const totalSuggestions = state.header.filteredSuggestion.length;
    if (totalSuggestions === 0) return;

    // Calculate next index
    const nextIndex = state.header.suggestionIndex === undefined
      ? 0
      : (state.header.suggestionIndex + 1) % totalSuggestions;

    state.header.suggestionIndex = nextIndex;

    const scrollOffset = state.header.suggestionScrollOffset;

    // If we wrapped around to the beginning, reset scroll to top
    if (nextIndex === 0) {
      state.header.suggestionScrollOffset = 0;
    } // Keep selected item at positions 0-2 (scroll when it would be at position 3+)
    else if (
      nextIndex - scrollOffset >= Math.min(3, SUGGESTION_VISIBLE_COUNT)
    ) {
      const maxScrollOffset = Math.max(
        0,
        totalSuggestions - SUGGESTION_VISIBLE_COUNT,
      );
      state.header.suggestionScrollOffset = Math.min(
        nextIndex - 2,
        maxScrollOffset,
      );
    }
  },

  headerSuggestionPrev: (state: EditCommitMessageState) => {
    const totalSuggestions = state.header.filteredSuggestion.length;
    if (totalSuggestions === 0) return;

    // If no suggestion is selected, do nothing (don't select last item)
    if (state.header.suggestionIndex === undefined) {
      return;
    }

    // Calculate previous index
    const prevIndex = (state.header.suggestionIndex - 1 + totalSuggestions) %
      totalSuggestions;

    state.header.suggestionIndex = prevIndex;

    const scrollOffset = state.header.suggestionScrollOffset;

    // If we wrapped around to the end, scroll to show last items
    if (prevIndex === totalSuggestions - 1) {
      state.header.suggestionScrollOffset = Math.max(
        0,
        totalSuggestions - SUGGESTION_VISIBLE_COUNT,
      );
    } // Keep selected item at positions 0-2 (scroll when it would be above position 0)
    else if (prevIndex < scrollOffset) {
      state.header.suggestionScrollOffset = Math.max(0, prevIndex - 2);
    }
  },

  headerSuggestionAccept: (state: EditCommitMessageState) => {
    if (state.header.suggestionIndex !== undefined) {
      const suggestion =
        state.header.filteredSuggestion[state.header.suggestionIndex];
      state.header.value = suggestion.value;
      state.header.cursor = suggestion.value.length;
      state.header.suggestionIndex = undefined;
      state.header.suggestionScrollOffset = 0;
      updateDecorators(state);
    }
  },

  headerSuggestionCancel: (state: EditCommitMessageState) => {
    state.header.suggestionIndex = undefined;
    state.header.suggestionScrollOffset = 0;
  },
};
