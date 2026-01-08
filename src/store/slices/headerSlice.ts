/**
 * Header slice: commit message header with autocomplete suggestions
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

/**
 * Updates filtered suggestions based on current header value
 */
function updateFilteredSuggestions(state: EditCommitMessageState): void {
  state.header.filteredSuggestion = state.header.suggestion.filter((
    suggestion,
  ) => suggestion.value.startsWith(state.header.value));
}

export const headerSlice = {
  headerType: (
    state: EditCommitMessageState,
    action: PayloadAction<{ char: string }>,
  ) => {
    const { char } = action.payload;
    typeChar(state.header, char);
    updateFilteredSuggestions(state);
  },

  headerDelete: (state: EditCommitMessageState) => {
    deleteChar(state.header);
    updateFilteredSuggestions(state);
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
    }
  },

  headerSuggestionCancel: (state: EditCommitMessageState) => {
    state.header.suggestionIndex = undefined;
  },
};
