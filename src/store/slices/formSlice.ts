/**
 * Form slice: mode and focus management for edit commit message
 */

import type { EditCommitMessageState } from "./editCommitMessageTypes.ts";

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
};
