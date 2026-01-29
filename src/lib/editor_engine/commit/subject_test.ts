import { assertEquals } from "jsr:@std/assert";
import { SubjectNode } from "./subject.ts";

Deno.test("SubjectNode - trigger: /^[\\s\\S]+/ matches any non-empty content", () => {
  const node = new SubjectNode();
  const trigger = node.next[0].trigger;

  // Should match simple text
  assertEquals(trigger.test("add new feature"), true);
  assertEquals(trigger.test("fix bug"), true);
  assertEquals(trigger.test("update documentation"), true);

  // Should match text with special characters
  assertEquals(trigger.test("add API endpoint /users"), true);
  assertEquals(trigger.test("fix #123"), true);
  assertEquals(trigger.test("update @types/node"), true);

  // Should match single character
  assertEquals(trigger.test("a"), true);

  // Should NOT match empty string
  assertEquals(trigger.test(""), false);

  // Extract matched value
  const match1 = "add new feature".match(trigger);
  assertEquals(match1?.[0], "add new feature");

  const match2 = "fix bug in auth".match(trigger);
  assertEquals(match2?.[0], "fix bug in auth");
});

Deno.test("SubjectNode - trigger: matches multiline content", () => {
  const node = new SubjectNode();
  const trigger = node.next[0].trigger;

  // Should match content with newlines
  const multiline = "add feature\nwith description";
  assertEquals(trigger.test(multiline), true);

  const match = multiline.match(trigger);
  assertEquals(match?.[0], "add feature\nwith description");
});

Deno.test("SubjectNode - trigger: validates transition target", () => {
  const node = new SubjectNode();

  // Should loop back to 'subject' (stays in same state)
  assertEquals(node.next[0].to, "subject");
});

Deno.test("SubjectNode - trigger: handles various content types", () => {
  const node = new SubjectNode();
  const trigger = node.next[0].trigger;

  // Text with numbers
  const match1 = "add v2 API endpoint".match(trigger);
  assertEquals(match1?.[0], "add v2 API endpoint");

  // Text with punctuation
  const match2 = "fix: issue with auth!".match(trigger);
  assertEquals(match2?.[0], "fix: issue with auth!");

  // Text with emojis
  const match3 = "add 🚀 feature".match(trigger);
  assertEquals(match3?.[0], "add 🚀 feature");

  // Text with unicode
  const match4 = "修正: バグを修正".match(trigger);
  assertEquals(match4?.[0], "修正: バグを修正");

  // Text with special symbols
  const match5 = "add $variable support".match(trigger);
  assertEquals(match5?.[0], "add $variable support");
});

Deno.test("SubjectNode - trigger: real-world examples", () => {
  const node = new SubjectNode();
  const trigger = node.next[0].trigger;

  // Short subject
  assertEquals(trigger.test("initial commit"), true);

  // Long subject
  assertEquals(
    trigger.test(
      "add comprehensive error handling for API requests with retry logic",
    ),
    true,
  );

  // Subject with references
  assertEquals(trigger.test("fix authentication bug (#123)"), true);

  // Subject with scope notation (allowed in subject)
  assertEquals(trigger.test("update user service (api)"), true);
});

Deno.test("SubjectNode - trigger: consumes all remaining input", () => {
  const node = new SubjectNode();
  const trigger = node.next[0].trigger;

  // The regex uses [\s\S]+ which matches any character including newlines
  // This ensures SubjectNode consumes everything remaining

  const remaining = "add feature with detailed description and examples";
  const match = remaining.match(trigger);

  // Should match the entire remaining string
  assertEquals(match?.[0], remaining);
  assertEquals(match?.[0].length, remaining.length);
});

Deno.test("SubjectNode - edge cases: single character subjects", () => {
  const node = new SubjectNode();
  const trigger = node.next[0].trigger;

  // Single letter
  assertEquals(trigger.test("a"), true);
  assertEquals(trigger.test("x"), true);

  // Single number
  assertEquals(trigger.test("1"), true);

  // Single special character
  assertEquals(trigger.test("!"), true);
  assertEquals(trigger.test("@"), true);
  assertEquals(trigger.test("#"), true);
});

Deno.test("SubjectNode - edge cases: subjects with extreme lengths", () => {
  const node = new SubjectNode();
  const trigger = node.next[0].trigger;

  // Very short
  assertEquals(trigger.test("a"), true);

  // Very long (100+ characters)
  const longSubject =
    "add a very long commit message that describes in great detail all the changes made to the codebase including refactoring, bug fixes, and new features";
  assertEquals(trigger.test(longSubject), true);
  const match = longSubject.match(trigger);
  assertEquals(match?.[0], longSubject);
});

Deno.test("SubjectNode - edge cases: subjects with only whitespace prefix", () => {
  const node = new SubjectNode();
  const trigger = node.next[0].trigger;

  // Leading spaces are included
  const match1 = "  add feature".match(trigger);
  assertEquals(match1?.[0], "  add feature");

  // Leading tabs
  const match2 = "\tadd feature".match(trigger);
  assertEquals(match2?.[0], "\tadd feature");

  // Mixed whitespace
  const match3 = " \t add feature".match(trigger);
  assertEquals(match3?.[0], " \t add feature");
});

Deno.test("SubjectNode - edge cases: subjects with special formatting", () => {
  const node = new SubjectNode();
  const trigger = node.next[0].trigger;

  // URLs
  const match1 = "add support for https://example.com".match(trigger);
  assertEquals(match1?.[0], "add support for https://example.com");

  // Email addresses
  const match2 = "update contact to user@example.com".match(trigger);
  assertEquals(match2?.[0], "update contact to user@example.com");

  // File paths
  const match3 = "fix bug in src/lib/utils.ts".match(trigger);
  assertEquals(match3?.[0], "fix bug in src/lib/utils.ts");

  // Code snippets
  const match4 = "add const x = 10;".match(trigger);
  assertEquals(match4?.[0], "add const x = 10;");
});

Deno.test("SubjectNode - edge cases: subjects with line breaks", () => {
  const node = new SubjectNode();
  const trigger = node.next[0].trigger;

  // Newline in middle
  const match1 = "add feature\nwith details".match(trigger);
  assertEquals(match1?.[0], "add feature\nwith details");

  // Multiple newlines
  const match2 = "add\n\nfeature".match(trigger);
  assertEquals(match2?.[0], "add\n\nfeature");

  // Carriage return + newline
  const match3 = "add\r\nfeature".match(trigger);
  assertEquals(match3?.[0], "add\r\nfeature");
});

Deno.test("SubjectNode - self-loop: always stays in subject", () => {
  const node = new SubjectNode();

  // SubjectNode should only have one transition that loops back to itself
  assertEquals(node.next.length, 1);
  assertEquals(node.next[0].to, "subject");

  // This creates a terminal state where all input is consumed
  const trigger = node.next[0].trigger;
  assertEquals(trigger.test("anything goes here"), true);
});
