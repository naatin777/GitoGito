import { expect, test } from "bun:test";

const assertEquals = (actual: unknown, expected: unknown) => {
  expect(actual).toEqual(expected);
};
import { SeparatorNode } from "./separator.ts";

test("SeparatorNode - trigger: /^!?:\\s*/ matches colon separator", () => {
  const node = new SeparatorNode();
  const trigger = node.next[0].trigger;

  // Should match ':' alone
  assertEquals(trigger.test(":"), true);

  // Should match ': ' with space
  assertEquals(trigger.test(": "), true);

  // Should match ':  ' with multiple spaces
  assertEquals(trigger.test(":  "), true);

  // Should NOT match without colon
  assertEquals(trigger.test(" "), false);
  assertEquals(trigger.test(""), false);

  // Extract matched value
  const match1 = ":".match(trigger);
  assertEquals(match1?.[0], ":");

  const match2 = ": add feature".match(trigger);
  assertEquals(match2?.[0], ": ");

  const match3 = ":add feature".match(trigger);
  assertEquals(match3?.[0], ":");
});

test("SeparatorNode - trigger: /^!?:\\s*/ matches breaking change separator", () => {
  const node = new SeparatorNode();
  const trigger = node.next[0].trigger;

  // Should match '!:' alone
  assertEquals(trigger.test("!:"), true);

  // Should match '!: ' with space
  assertEquals(trigger.test("!: "), true);

  // Should match '!:  ' with multiple spaces
  assertEquals(trigger.test("!:  "), true);

  // Should NOT match '!' without colon
  assertEquals(trigger.test("!"), false);

  // Extract matched value
  const match1 = "!:".match(trigger);
  assertEquals(match1?.[0], "!:");

  const match2 = "!: breaking change".match(trigger);
  assertEquals(match2?.[0], "!: ");

  const match3 = "!:breaking change".match(trigger);
  assertEquals(match3?.[0], "!:");
});

test("SeparatorNode - trigger: validates transition target", () => {
  const node = new SeparatorNode();

  // Should transition to 'subject'
  assertEquals(node.next[0].to, "subject");
});

test("SeparatorNode - trigger: handles various whitespace", () => {
  const node = new SeparatorNode();
  const trigger = node.next[0].trigger;

  // Single space
  const match1 = ": add".match(trigger);
  assertEquals(match1?.[0], ": ");

  // Multiple spaces
  const match2 = ":   add".match(trigger);
  assertEquals(match2?.[0], ":   ");

  // Tab character
  const match3 = ":\tadd".match(trigger);
  assertEquals(match3?.[0], ":\t");

  // No space
  const match4 = ":add".match(trigger);
  assertEquals(match4?.[0], ":");

  // Breaking change with spaces
  const match5 = "!:  breaking".match(trigger);
  assertEquals(match5?.[0], "!:  ");
});

test("SeparatorNode - trigger: real-world examples", () => {
  const node = new SeparatorNode();
  const trigger = node.next[0].trigger;

  // Normal separator
  assertEquals(trigger.test(": add new feature"), true);
  const match1 = ": add new feature".match(trigger);
  assertEquals(match1?.[0], ": ");

  // Breaking change separator
  assertEquals(trigger.test("!: remove deprecated API"), true);
  const match2 = "!: remove deprecated API".match(trigger);
  assertEquals(match2?.[0], "!: ");

  // No space after separator
  assertEquals(trigger.test(":update docs"), true);
  const match3 = ":update docs".match(trigger);
  assertEquals(match3?.[0], ":");
});

test("SeparatorNode - edge cases: only separator allowed", () => {
  const node = new SeparatorNode();
  const trigger = node.next[0].trigger;

  // Should NOT match without colon
  assertEquals(trigger.test("!"), false);
  assertEquals(trigger.test("! "), false);
  assertEquals(trigger.test("add feature"), false);
  assertEquals(trigger.test("(api)"), false);
  assertEquals(trigger.test("feat"), false);

  // Should match only valid separators
  assertEquals(trigger.test(":"), true);
  assertEquals(trigger.test("!:"), true);
});

test("SeparatorNode - edge cases: consecutive separators", () => {
  const node = new SeparatorNode();
  const trigger = node.next[0].trigger;

  // Should match first separator only
  const match1 = "::".match(trigger);
  assertEquals(match1?.[0], ":");

  const match2 = "!::".match(trigger);
  assertEquals(match2?.[0], "!:");

  // Multiple exclamations are not valid
  assertEquals(trigger.test("!!:"), false);
});

test("SeparatorNode - edge cases: special characters after separator", () => {
  const node = new SeparatorNode();
  const trigger = node.next[0].trigger;

  // Separator followed by special characters
  const match1 = ": @mention".match(trigger);
  assertEquals(match1?.[0], ": ");

  const match2 = "!: #123".match(trigger);
  assertEquals(match2?.[0], "!: ");

  const match3 = ": /path/to/file".match(trigger);
  assertEquals(match3?.[0], ": ");

  const match4 = ": 日本語".match(trigger);
  assertEquals(match4?.[0], ": ");
});
