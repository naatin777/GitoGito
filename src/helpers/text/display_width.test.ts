import { expect, test } from "bun:test";

const assertEquals = (actual: unknown, expected: unknown) => {
  expect(actual).toEqual(expected);
};
import { getDisplayWidth } from "./display_width.ts";

test("getDisplayWidth - ASCII characters", () => {
  assertEquals(getDisplayWidth("hello"), 5);
  assertEquals(getDisplayWidth("fix: add login"), 14);
});

test("getDisplayWidth - Japanese characters (full-width)", () => {
  // Japanese characters are typically 2 columns wide
  assertEquals(getDisplayWidth("こんにちは"), 10); // 5 chars * 2 width
  assertEquals(getDisplayWidth("日本語"), 6); // 3 chars * 2 width
});

test("getDisplayWidth - mixed ASCII and Japanese", () => {
  assertEquals(getDisplayWidth("fix: 日本語"), 11); // "fix: " (5) + "日本語" (6)
});

test("getDisplayWidth - emoji", () => {
  // Emoji width can vary, but typically 2
  const width = getDisplayWidth("🎉");
  assertEquals(width >= 1, true); // At least 1, usually 2
});

test("getDisplayWidth - empty string", () => {
  assertEquals(getDisplayWidth(""), 0);
});

test("getDisplayWidth - spaces", () => {
  assertEquals(getDisplayWidth("   "), 3);
});

test("getDisplayWidth - special characters", () => {
  assertEquals(getDisplayWidth("!@#$%"), 5);
});
