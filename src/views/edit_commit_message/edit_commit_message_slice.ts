import { createSlice } from "@reduxjs/toolkit";
import { COMMIT_MESSAGE_PREFIXL } from "../../constants/commit_message/prefix.ts";
import { bodySlice } from "./bodySlice.ts";
import type { EditCommitMessageState } from "./types.ts";
import { footerSlice } from "./footerSlice.ts";
import { formSlice } from "./formSlice.ts";
import { headerSlice } from "./headerSlice.ts";

const initialState: EditCommitMessageState = {
  form: {
    mode: "normal",
    focus: "header",
    flags: {}, // Initialize with empty flags
  },
  header: {
    value: "",
    cursor: 0,
    suggestion: COMMIT_MESSAGE_PREFIXL,
    filteredSuggestion: COMMIT_MESSAGE_PREFIXL,
    suggestionIndex: undefined,
    suggestionScrollOffset: 0,
    decorated: null, // Initialize with no decorations
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
    ...formSlice,

    // Header actions
    ...headerSlice,

    // Body actions
    ...bodySlice,

    // Footer actions
    ...footerSlice,

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
  setFlags,
  toggleFlag,
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
