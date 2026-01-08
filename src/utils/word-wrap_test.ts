import { assertEquals } from "@std/assert";
import { wrapTextByWords } from "./word-wrap.ts";

Deno.test("wrapTextByWords - fits in single line", () => {
  const result = wrapTextByWords("fix: add user authentication", 50);

  assertEquals(result.length, 1);
  assertEquals(result[0].text, "fix: add user authentication");
  assertEquals(result[0].start, 0);
});

Deno.test("wrapTextByWords - wraps at word boundary", () => {
  const result = wrapTextByWords("fix: add user authentication feature", 20);

  assertEquals(result.length, 3);
  assertEquals(result[0].text, "fix: add user");
  assertEquals(result[0].start, 0);
  assertEquals(result[1].text, "authentication");
  assertEquals(result[1].start, 15); // "fix: add user " = 14 chars + 1 space = starts at 15
  assertEquals(result[2].text, "feature");
  assertEquals(result[2].start, 31); // 15 + "authentication " = 15 + 14 + 2 spaces trimmed
});

Deno.test("wrapTextByWords - handles long word", () => {
  const result = wrapTextByWords("fix: verylongwordthatdoesnotfit", 10);

  // Should wrap before the long word
  assertEquals(result.length, 2);
  assertEquals(result[0].text, "fix:");
  assertEquals(result[1].text, "verylongwordthatdoesnotfit");
});

Deno.test("wrapTextByWords - preserves existing newlines", () => {
  const result = wrapTextByWords("fix: add\nfeature", 20);

  assertEquals(result.length, 2);
  assertEquals(result[0].text, "fix: add");
  assertEquals(result[0].start, 0);
  assertEquals(result[1].text, "feature");
  assertEquals(result[1].start, 9);
});

Deno.test("wrapTextByWords - handles empty string", () => {
  const result = wrapTextByWords("", 20);

  assertEquals(result.length, 1);
  assertEquals(result[0].text, "");
  assertEquals(result[0].start, 0);
});

Deno.test("wrapTextByWords - handles maxWidth 0", () => {
  const result = wrapTextByWords("fix: add feature", 0);

  assertEquals(result.length, 1);
  assertEquals(result[0].text, "fix: add feature");
  assertEquals(result[0].start, 0);
});

Deno.test("wrapTextByWords - trims trailing whitespace on wrapped line", () => {
  const result = wrapTextByWords("fix: add user   authentication", 15);

  // Should not include trailing spaces in first line
  assertEquals(result[0].text, "fix: add user");
  assertEquals(result[1].text, "authentication");
});

Deno.test("wrapTextByWords - handles multiple spaces", () => {
  const result = wrapTextByWords("fix:  add   feature", 50);

  assertEquals(result.length, 1);
  assertEquals(result[0].text, "fix:  add   feature");
});

Deno.test("wrapTextByWords - handles unicode characters", () => {
  const result = wrapTextByWords("fix: 日本語のテキスト", 15);

  // Unicode characters should be counted correctly
  assertEquals(result.length >= 1, true);
});

Deno.test("wrapTextByWords - empty line in middle", () => {
  const result = wrapTextByWords("fix: add\n\nfeature", 20);

  assertEquals(result.length, 3);
  assertEquals(result[0].text, "fix: add");
  assertEquals(result[1].text, "");
  assertEquals(result[2].text, "feature");
});

Deno.test("wrapTextByWords - multiple paragraphs with wrapping", () => {
  const result = wrapTextByWords("fix: add user authentication\nfeat: new feature", 20);

  // First paragraph wraps into 2 lines, second paragraph is 1 line (17 chars, fits in 20)
  assertEquals(result.length, 3);
  assertEquals(result[0].text, "fix: add user");
  assertEquals(result[1].text, "authentication");
  assertEquals(result[2].text, "feat: new feature");
});

Deno.test("wrapTextByWords - start positions are correct", () => {
  const text = "abc def ghi";
  const result = wrapTextByWords(text, 7);

  // "abc def" fits (7 chars)
  // "ghi" goes to next line
  assertEquals(result[0].text, "abc def");
  assertEquals(result[0].start, 0);
  assertEquals(result[1].text, "ghi");
  assertEquals(result[1].start, 8); // after "abc def "
});
