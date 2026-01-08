import { createSlice } from "@reduxjs/toolkit";
import { COMMIT_MESSAGE_PREFIXL } from "../../constants/commit-message/prefix.ts";
import type { Suggestion } from "../../type.ts";

// Form state
type FormState = {
  mode: "normal" | "ai";
  focus: "header" | "body" | "footer";
};

// Header state (with suggestions)
type HeaderState = {
  value: string;
  cursor: number;
  suggestion: Suggestion[];
  filteredSuggestion: Suggestion[];
  suggestionIndex: number | undefined;
};

// Body and Footer state (simple text editor)
type TextFieldState = {
  value: string;
  cursor: number;
};

// Combined state
type EditCommitMessageState = {
  form: FormState;
  header: HeaderState;
  body: TextFieldState;
  footer: TextFieldState;
};

const initialState: EditCommitMessageState = {
  form: {
    mode: "normal",
    focus: "header",
  },
  header: {
    value: "",
    cursor: 0,
    suggestion: COMMIT_MESSAGE_PREFIXL,
    filteredSuggestion: COMMIT_MESSAGE_PREFIXL,
    suggestionIndex: undefined,
  },
  body: {
    value: "",
    cursor: 0,
  },
  footer: {
    value: "",
    cursor: 0,
  },
};

const editCommitMessageSlice = createSlice({
  name: "editCommitMessage",
  initialState,
  reducers: {
    // Form actions
    changeToAiMode: (state) => {
      state.form.mode = "ai";
    },
    changeToNormalMode: (state) => {
      state.form.mode = "normal";
    },
    focusHeader: (state) => {
      state.form.focus = "header";
    },
    focusBody: (state) => {
      state.form.focus = "body";
    },
    focusFooter: (state) => {
      state.form.focus = "footer";
    },

    // Header actions
    headerType: (state, action) => {
      const { char } = action.payload;
      state.header.value = state.header.value.slice(0, state.header.cursor) +
        char +
        state.header.value.slice(state.header.cursor);
      state.header.cursor += char.length;
      state.header.filteredSuggestion = state.header.suggestion.filter((
        suggestion,
      ) => suggestion.value.startsWith(state.header.value));
    },
    headerDelete: (state) => {
      if (state.header.cursor === 0) return;
      state.header.value =
        state.header.value.slice(0, state.header.cursor - 1) +
        state.header.value.slice(state.header.cursor);
      state.header.cursor -= 1;
      state.header.filteredSuggestion = state.header.suggestion.filter((
        suggestion,
      ) => suggestion.value.startsWith(state.header.value));
    },
    headerCursorLeft: (state) => {
      state.header.cursor = Math.max(0, state.header.cursor - 1);
    },
    headerCursorRight: (state) => {
      state.header.cursor = Math.min(
        state.header.value.length,
        state.header.cursor + 1,
      );
    },
    headerGoToStart: (state) => {
      state.header.cursor = 0;
    },
    headerGoToEnd: (state) => {
      state.header.cursor = state.header.value.length;
    },
    headerSuggestionNext: (state) => {
      state.header.suggestionIndex = state.header.suggestionIndex === undefined
        ? 0
        : (state.header.suggestionIndex + 1) %
          state.header.filteredSuggestion.length;
    },
    headerSuggestionPrev: (state) => {
      state.header.suggestionIndex = state.header.suggestionIndex === undefined
        ? undefined
        : (state.header.suggestionIndex - 1 +
          state.header.filteredSuggestion.length) %
          state.header.filteredSuggestion.length;
    },
    headerSuggestionAccept: (state) => {
      if (state.header.suggestionIndex !== undefined) {
        const suggestion =
          state.header.filteredSuggestion[state.header.suggestionIndex];
        state.header.value = suggestion.value;
        state.header.cursor = suggestion.value.length;
        state.header.suggestionIndex = undefined;
      }
    },
    headerSuggestionCancel: (state) => {
      state.header.suggestionIndex = undefined;
    },

    // Body actions
    bodyType: (state, action) => {
      const { char } = action.payload;
      state.body.value = state.body.value.slice(0, state.body.cursor) +
        char +
        state.body.value.slice(state.body.cursor);
      state.body.cursor += char.length;
    },
    bodyDelete: (state) => {
      if (state.body.cursor === 0) return;
      state.body.value = state.body.value.slice(0, state.body.cursor - 1) +
        state.body.value.slice(state.body.cursor);
      state.body.cursor -= 1;
    },
    bodyCursorLeft: (state) => {
      state.body.cursor = Math.max(0, state.body.cursor - 1);
    },
    bodyCursorRight: (state) => {
      state.body.cursor = Math.min(
        state.body.value.length,
        state.body.cursor + 1,
      );
    },
    bodyGoToStart: (state) => {
      state.body.cursor = 0;
    },
    bodyGoToEnd: (state) => {
      state.body.cursor = state.body.value.length;
    },

    // Footer actions
    footerType: (state, action) => {
      const { char } = action.payload;
      state.footer.value = state.footer.value.slice(0, state.footer.cursor) +
        char +
        state.footer.value.slice(state.footer.cursor);
      state.footer.cursor += char.length;
    },
    footerDelete: (state) => {
      if (state.footer.cursor === 0) return;
      state.footer.value =
        state.footer.value.slice(0, state.footer.cursor - 1) +
        state.footer.value.slice(state.footer.cursor);
      state.footer.cursor -= 1;
    },
    footerCursorLeft: (state) => {
      state.footer.cursor = Math.max(0, state.footer.cursor - 1);
    },
    footerCursorRight: (state) => {
      state.footer.cursor = Math.min(
        state.footer.value.length,
        state.footer.cursor + 1,
      );
    },
    footerGoToStart: (state) => {
      state.footer.cursor = 0;
    },
    footerGoToEnd: (state) => {
      state.footer.cursor = state.footer.value.length;
    },

    // Reset
    reset: () => initialState,
  },
});

export const {
  changeToAiMode,
  changeToNormalMode,
  focusHeader,
  focusBody,
  focusFooter,
  headerType,
  headerDelete,
  headerCursorLeft,
  headerCursorRight,
  headerGoToStart,
  headerGoToEnd,
  headerSuggestionNext,
  headerSuggestionPrev,
  headerSuggestionAccept,
  headerSuggestionCancel,
  bodyType,
  bodyDelete,
  bodyCursorLeft,
  bodyCursorRight,
  bodyGoToStart,
  bodyGoToEnd,
  footerType,
  footerDelete,
  footerCursorLeft,
  footerCursorRight,
  footerGoToStart,
  footerGoToEnd,
  reset,
} = editCommitMessageSlice.actions;

export const editCommitMessageReducer = editCommitMessageSlice.reducer;
