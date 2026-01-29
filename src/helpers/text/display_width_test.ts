import { assertEquals } from "@std/assert";
import { getDisplayWidth } from "./display_width.ts";

Deno.test("getDisplayWidth - ASCII characters", () => {
  assertEquals(getDisplayWidth("hello"), 5);
  assertEquals(getDisplayWidth("fix: add login"), 14);
});

Deno.test("getDisplayWidth - Japanese characters (full-width)", () => {
  // Japanese characters are typically 2 columns wide
  assertEquals(getDisplayWidth("こんにちは"), 10); // 5 chars * 2 width
  assertEquals(getDisplayWidth("日本語"), 6); // 3 chars * 2 width
});

Deno.test("getDisplayWidth - mixed ASCII and Japanese", () => {
  assertEquals(getDisplayWidth("fix: 日本語"), 11); // "fix: " (5) + "日本語" (6)
});

Deno.test("getDisplayWidth - emoji", () => {
  // Emoji width can vary, but typically 2
  const width = getDisplayWidth("🎉");
  assertEquals(width >= 1, true); // At least 1, usually 2
});

Deno.test("getDisplayWidth - empty string", () => {
  assertEquals(getDisplayWidth(""), 0);
});

Deno.test("getDisplayWidth - spaces", () => {
  assertEquals(getDisplayWidth("   "), 3);
});

Deno.test("getDisplayWidth - special characters", () => {
  assertEquals(getDisplayWidth("!@#$%"), 5);
});
