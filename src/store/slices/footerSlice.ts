/**
 * Footer slice: commit message footer text editor
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

export const footerSlice = {
  footerType: (
    state: EditCommitMessageState,
    action: PayloadAction<{ char: string }>,
  ) => {
    const { char } = action.payload;
    typeChar(state.footer, char);
  },

  footerDelete: (state: EditCommitMessageState) => {
    deleteChar(state.footer);
  },

  footerCursorLeft: (state: EditCommitMessageState) => {
    moveCursorLeft(state.footer);
  },

  footerCursorRight: (state: EditCommitMessageState) => {
    moveCursorRight(state.footer);
  },

  footerGoToStart: (state: EditCommitMessageState) => {
    moveCursorToStart(state.footer);
  },

  footerGoToEnd: (state: EditCommitMessageState) => {
    moveCursorToEnd(state.footer);
  },
};
