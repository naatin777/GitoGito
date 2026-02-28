/**
 * Calculates the display width of text considering unicode characters
 * (e.g., "あ" counts as 2, emoji might count as 2, etc.)
 *
 * @param text - The text to measure
 * @returns The display width in terminal columns
 *
 * @example
 * getDisplayWidth("hello")  // => 5
 * getDisplayWidth("こんにちは")  // => 10
 * getDisplayWidth("🎉")  // => 2
 */
export function getDisplayWidth(text: string): number {
  let width = 0;
  for (const char of text) {
    width += Bun.stringWidth(char);
  }
  return width;
}
