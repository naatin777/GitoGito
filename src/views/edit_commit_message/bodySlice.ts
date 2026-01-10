/**
 * Body slice: commit message body text editor
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

export const bodySlice = {
  bodyType: (
    state: EditCommitMessageState,
    action: PayloadAction<{ char: string }>,
  ) => {
    const { char } = action.payload;
    typeChar(state.body, char);
  },

  bodyDelete: (state: EditCommitMessageState) => {
    deleteChar(state.body);
  },

  bodyCursorLeft: (state: EditCommitMessageState) => {
    moveCursorLeft(state.body);
  },

  bodyCursorRight: (state: EditCommitMessageState) => {
    moveCursorRight(state.body);
  },

  bodyGoToStart: (state: EditCommitMessageState) => {
    moveCursorToStart(state.body);
  },

  bodyGoToEnd: (state: EditCommitMessageState) => {
    moveCursorToEnd(state.body);
  },
};
