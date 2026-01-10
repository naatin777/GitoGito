/**
 * Reusable text field state mutation helpers for Redux Toolkit slices
 * These functions can be used in immer-based reducers to manipulate text field state
 */

export type TextFieldState = {
  value: string;
  cursor: number;
};

/**
 * Inserts a character at the current cursor position
 */
export function typeChar(state: TextFieldState, char: string): void {
  state.value = state.value.slice(0, state.cursor) +
    char +
    state.value.slice(state.cursor);
  state.cursor += char.length;
}

/**
 * Deletes the character before the cursor (backspace)
 */
export function deleteChar(state: TextFieldState): void {
  if (state.cursor === 0) return;
  state.value = state.value.slice(0, state.cursor - 1) +
    state.value.slice(state.cursor);
  state.cursor -= 1;
}

/**
 * Moves cursor one position to the left
 */
export function moveCursorLeft(state: TextFieldState): void {
  state.cursor = Math.max(0, state.cursor - 1);
}

/**
 * Moves cursor one position to the right
 */
export function moveCursorRight(state: TextFieldState): void {
  state.cursor = Math.min(state.value.length, state.cursor + 1);
}

/**
 * Moves cursor to the start of the text
 */
export function moveCursorToStart(state: TextFieldState): void {
  state.cursor = 0;
}

/**
 * Moves cursor to the end of the text
 */
export function moveCursorToEnd(state: TextFieldState): void {
  state.cursor = state.value.length;
}
