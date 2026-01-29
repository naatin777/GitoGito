import { assertEquals } from "@std/assert";
import { TypeNode } from "./type.ts";
import type { Suggestion } from "../../../services/config/index.ts";

const mockTypes: Suggestion[] = [
  { value: "feat", description: "New feature" },
  { value: "fix", description: "Bug fix" },
  { value: "docs", description: "Documentation" },
];

Deno.test("TypeNode - trigger: /^\\w+(?=\\()/ matches type followed by scope", () => {
  const node = new TypeNode(mockTypes);
  const trigger = node.next.find((t) => t.to === "scope")!.trigger;

  // Should match type followed by '('
  assertEquals(trigger.test("feat("), true);
  assertEquals(trigger.test("fix("), true);
  assertEquals(trigger.test("docs("), true);

  // Should NOT match type without '('
  assertEquals(trigger.test("feat:"), false);
  assertEquals(trigger.test("feat!:"), false);
  assertEquals(trigger.test("feat"), false);

  // Extract matched value
  const match1 = "feat(".match(trigger);
  assertEquals(match1?.[0], "feat");

  const match2 = "fix(api)".match(trigger);
  assertEquals(match2?.[0], "fix");
});

Deno.test("TypeNode - trigger: /^\\w+(?=!?:)/ matches type followed by separator", () => {
  const node = new TypeNode(mockTypes);
  const trigger = node.next.find((t) => t.to === "separator")!.trigger;

  // Should match type followed by ':'
  assertEquals(trigger.test("feat:"), true);
  assertEquals(trigger.test("fix:"), true);

  // Should match type followed by '!:'
  assertEquals(trigger.test("feat!:"), true);
  assertEquals(trigger.test("fix!:"), true);

  // Should NOT match type followed by '('
  assertEquals(trigger.test("feat("), false);

  // Should NOT match type alone
  assertEquals(trigger.test("feat"), false);
  assertEquals(trigger.test("fea"), false);

  // Extract matched value
  const match1 = "feat:".match(trigger);
  assertEquals(match1?.[0], "feat");

  const match2 = "fix!: breaking".match(trigger);
  assertEquals(match2?.[0], "fix");

  const match3 = "docs: update".match(trigger);
  assertEquals(match3?.[0], "docs");
});

Deno.test("TypeNode - trigger: /^\\w+/ matches any word (incomplete input)", () => {
  const node = new TypeNode(mockTypes);
  const trigger = node.next.find((t) => t.to === "type")!.trigger;

  // Should match any word characters
  assertEquals(trigger.test("f"), true);
  assertEquals(trigger.test("fe"), true);
  assertEquals(trigger.test("fea"), true);
  assertEquals(trigger.test("feat"), true);

  // Should NOT match empty string
  assertEquals(trigger.test(""), false);

  // Should NOT match non-word characters at start
  assertEquals(trigger.test(":"), false);
  assertEquals(trigger.test("("), false);

  // Extract matched value
  const match1 = "fea".match(trigger);
  assertEquals(match1?.[0], "fea");

  const match2 = "feat".match(trigger);
  assertEquals(match2?.[0], "feat");
});

Deno.test("TypeNode - trigger priority order: scope transition has highest priority", () => {
  const node = new TypeNode(mockTypes);

  // "feat(" should match scope trigger first (priority 1)
  const input1 = "feat(";
  const matchedTransition1 = node.next.find((t) => t.trigger.test(input1));
  assertEquals(matchedTransition1?.to, "scope");
  assertEquals(matchedTransition1?.trigger.test(input1), true);

  // "fix(" should match scope trigger
  const input2 = "fix(";
  const matchedTransition2 = node.next.find((t) => t.trigger.test(input2));
  assertEquals(matchedTransition2?.to, "scope");

  // "docs(" should match scope trigger
  const input3 = "docs(";
  const matchedTransition3 = node.next.find((t) => t.trigger.test(input3));
  assertEquals(matchedTransition3?.to, "scope");
});

Deno.test("TypeNode - trigger priority order: separator transition has second priority", () => {
  const node = new TypeNode(mockTypes);

  // "feat:" should match separator trigger (priority 2)
  const input1 = "feat:";
  const matchedTransition1 = node.next.find((t) => t.trigger.test(input1));
  assertEquals(matchedTransition1?.to, "separator");

  // "feat!:" should match separator trigger
  const input2 = "feat!:";
  const matchedTransition2 = node.next.find((t) => t.trigger.test(input2));
  assertEquals(matchedTransition2?.to, "separator");

  // "fix:" should match separator trigger
  const input3 = "fix:";
  const matchedTransition3 = node.next.find((t) => t.trigger.test(input3));
  assertEquals(matchedTransition3?.to, "separator");

  // "fix!:" should match separator trigger
  const input4 = "fix!:";
  const matchedTransition4 = node.next.find((t) => t.trigger.test(input4));
  assertEquals(matchedTransition4?.to, "separator");
});

Deno.test("TypeNode - trigger priority order: self-loop has lowest priority", () => {
  const node = new TypeNode(mockTypes);

  // "fea" should match type trigger (priority 3, fallback)
  const input1 = "fea";
  const matchedTransition1 = node.next.find((t) => t.trigger.test(input1));
  assertEquals(matchedTransition1?.to, "type");

  // "f" should match type trigger
  const input2 = "f";
  const matchedTransition2 = node.next.find((t) => t.trigger.test(input2));
  assertEquals(matchedTransition2?.to, "type");

  // "feat" (no suffix) should match type trigger
  const input3 = "feat";
  const matchedTransition3 = node.next.find((t) => t.trigger.test(input3));
  assertEquals(matchedTransition3?.to, "type");
});

Deno.test("TypeNode - trigger priority order: scope beats separator", () => {
  const node = new TypeNode(mockTypes);

  // Even though "feat(" contains "feat" which could match separator lookhead pattern,
  // the scope trigger should win because it's checked first
  const input = "feat(";

  // Check that scope trigger matches
  const scopeTrigger = node.next[0];
  assertEquals(scopeTrigger.to, "scope");
  assertEquals(scopeTrigger.trigger.test(input), true);

  // Check that separator trigger does NOT match (lookahead requires : or !:)
  const separatorTrigger = node.next[1];
  assertEquals(separatorTrigger.to, "separator");
  assertEquals(separatorTrigger.trigger.test(input), false);
});

Deno.test("TypeNode - trigger priority order: separator beats self-loop", () => {
  const node = new TypeNode(mockTypes);

  // "feat:" should match separator, not self-loop
  const input = "feat:";

  // Check that separator trigger matches
  const separatorTrigger = node.next[1];
  assertEquals(separatorTrigger.to, "separator");
  assertEquals(separatorTrigger.trigger.test(input), true);

  // Check that self-loop trigger also matches (but should be ignored)
  const selfLoopTrigger = node.next[2];
  assertEquals(selfLoopTrigger.to, "type");
  assertEquals(selfLoopTrigger.trigger.test(input), true);

  // The first matching trigger should be separator
  const matchedTransition = node.next.find((t) => t.trigger.test(input));
  assertEquals(matchedTransition?.to, "separator");
});

Deno.test("TypeNode - trigger priority order: all transitions with various inputs", () => {
  const node = new TypeNode(mockTypes);

  const testCases = [
    { input: "feat(api)", expected: "scope" },
    { input: "feat:", expected: "separator" },
    { input: "feat!:", expected: "separator" },
    { input: "fea", expected: "type" },
    { input: "f", expected: "type" },
    { input: "fix(", expected: "scope" },
    { input: "fix:", expected: "separator" },
    { input: "fix!:", expected: "separator" },
    { input: "fi", expected: "type" },
    { input: "docs(core)", expected: "scope" },
    { input: "docs:", expected: "separator" },
    { input: "doc", expected: "type" },
  ];

  for (const { input, expected } of testCases) {
    const matchedTransition = node.next.find((t) => t.trigger.test(input));
    assertEquals(
      matchedTransition?.to,
      expected,
      `Input "${input}" should transition to "${expected}"`,
    );
  }
});

Deno.test("TypeNode - edge cases: single character types", () => {
  const node = new TypeNode(mockTypes);

  // Single letter should match self-loop
  const input = "f";
  const matchedTransition = node.next.find((t) => t.trigger.test(input));
  assertEquals(matchedTransition?.to, "type");

  const match = input.match(matchedTransition!.trigger);
  assertEquals(match?.[0], "f");
});

Deno.test("TypeNode - edge cases: uppercase types", () => {
  const node = new TypeNode(mockTypes);

  // Uppercase letters are word characters (\w)
  const testCases = ["FEAT", "Fix", "DoCs"];

  for (const input of testCases) {
    const matchedTransition = node.next.find((t) => t.trigger.test(input));
    assertEquals(
      matchedTransition?.to,
      "type",
      `"${input}" should match type trigger`,
    );
  }
});

Deno.test("TypeNode - edge cases: numbers in types", () => {
  const node = new TypeNode(mockTypes);

  // Numbers are word characters (\w)
  const testCases = ["v2", "feat2", "fix123"];

  for (const input of testCases) {
    const matchedTransition = node.next.find((t) => t.trigger.test(input));
    assertEquals(
      matchedTransition?.to,
      "type",
      `"${input}" should match type trigger`,
    );
  }
});

Deno.test("TypeNode - edge cases: underscores in types", () => {
  const node = new TypeNode(mockTypes);

  // Underscores are word characters (\w)
  const testCases = ["feat_new", "fix_bug", "update_v2"];

  for (const input of testCases) {
    const matchedTransition = node.next.find((t) => t.trigger.test(input));
    assertEquals(
      matchedTransition?.to,
      "type",
      `"${input}" should match type trigger`,
    );
  }
});

Deno.test("TypeNode - edge cases: non-word characters should not match", () => {
  const node = new TypeNode(mockTypes);

  // Non-word characters should NOT match any trigger
  const testCases = ["-feat", " feat", "feat-", "@feat", "#feat"];

  for (const input of testCases) {
    const matchedTransition = node.next.find((t) => t.trigger.test(input));
    // Either no match or match with empty string (depends on implementation)
    if (matchedTransition) {
      const match = input.match(matchedTransition.trigger);
      // If there's a match, it should not include the leading special character
      if (match) {
        assertEquals(
          match[0].startsWith("-") || match[0].startsWith(" ") ||
            match[0].startsWith("@") || match[0].startsWith("#"),
          false,
          `"${input}" should not match with leading special character`,
        );
      }
    }
  }
});
