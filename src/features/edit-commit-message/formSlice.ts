/**
 * Form slice: mode, focus, and flags management for edit commit message
 */

import type { PayloadAction } from "@reduxjs/toolkit";
import type {
  CommitFlags,
  EditCommitMessageState,
} from "./editCommitMessageTypes.ts";

export const formSlice = {
  changeToAiMode: (state: EditCommitMessageState) => {
    state.form.mode = "ai";
  },

  changeToNormalMode: (state: EditCommitMessageState) => {
    state.form.mode = "normal";
  },

  focusHeader: (state: EditCommitMessageState) => {
    state.form.focus = "header";
  },

  focusBody: (state: EditCommitMessageState) => {
    state.form.focus = "body";
  },

  focusFooter: (state: EditCommitMessageState) => {
    state.form.focus = "footer";
  },

  setFlags: (
    state: EditCommitMessageState,
    action: PayloadAction<CommitFlags>,
  ) => {
    state.form.flags = action.payload;
  },

  toggleFlag: (
    state: EditCommitMessageState,
    action: PayloadAction<keyof CommitFlags>,
  ) => {
    const flag = action.payload;
    state.form.flags[flag] = !state.form.flags[flag];
  },
};
