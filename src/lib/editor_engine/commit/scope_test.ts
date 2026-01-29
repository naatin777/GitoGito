import { assertEquals } from "jsr:@std/assert";
import { ScopeNode } from "./scope.ts";
import { Suggestion } from "../../../services/config/index.ts";

const mockScopes: Suggestion[] = [
  { value: "api", description: "API changes" },
  { value: "ui", description: "UI changes" },
  { value: "core", description: "Core functionality" },
];

Deno.test("ScopeNode - trigger: /^\\([^)]+\\)(?=!?:)/ matches complete scope followed by separator", () => {
  const node = new ScopeNode(mockScopes);
  const trigger = node.next.find((t) => t.to === "separator")!.trigger;

  // Should match complete scope followed by ':'
  assertEquals(trigger.test("(api):"), true);
  assertEquals(trigger.test("(ui):"), true);
  assertEquals(trigger.test("(core):"), true);

  // Should match complete scope followed by '!:'
  assertEquals(trigger.test("(api)!:"), true);
  assertEquals(trigger.test("(ui)!:"), true);

  // Should NOT match incomplete scope
  assertEquals(trigger.test("(api"), false);
  assertEquals(trigger.test("("), false);

  // Should NOT match scope without separator
  assertEquals(trigger.test("(api)"), false);

  // Should NOT match empty scope
  assertEquals(trigger.test("():"), false);

  // Extract matched value
  const match1 = "(api):".match(trigger);
  assertEquals(match1?.[0], "(api)");

  const match2 = "(ui)!: breaking".match(trigger);
  assertEquals(match2?.[0], "(ui)");

  const match3 = "(core): update".match(trigger);
  assertEquals(match3?.[0], "(core)");
});

Deno.test("ScopeNode - trigger: /^\\([^)]*/ matches incomplete scope", () => {
  const node = new ScopeNode(mockScopes);
  const trigger = node.next.find((t) => t.to === "scope")!.trigger;

  // Should match opening parenthesis
  assertEquals(trigger.test("("), true);

  // Should match incomplete scope
  assertEquals(trigger.test("(a"), true);
  assertEquals(trigger.test("(ap"), true);
  assertEquals(trigger.test("(api"), true);

  // Should match empty scope
  assertEquals(trigger.test("("), true);

  // Should NOT match without opening parenthesis
  assertEquals(trigger.test("api"), false);
  assertEquals(trigger.test(""), false);

  // Extract matched value
  const match1 = "(a".match(trigger);
  assertEquals(match1?.[0], "(a");

  const match2 = "(api".match(trigger);
  assertEquals(match2?.[0], "(api");

  const match3 = "(".match(trigger);
  assertEquals(match3?.[0], "(");
});

Deno.test("ScopeNode - trigger priority order: complete scope has highest priority", () => {
  const node = new ScopeNode(mockScopes);

  // "(api):" should match separator trigger first (priority 1)
  const input1 = "(api):";
  const matchedTransition1 = node.next.find((t) => t.trigger.test(input1));
  assertEquals(matchedTransition1?.to, "separator");
  assertEquals(matchedTransition1?.trigger.test(input1), true);

  // "(ui)!:" should match separator trigger
  const input2 = "(ui)!:";
  const matchedTransition2 = node.next.find((t) => t.trigger.test(input2));
  assertEquals(matchedTransition2?.to, "separator");

  // "(core):" should match separator trigger
  const input3 = "(core):";
  const matchedTransition3 = node.next.find((t) => t.trigger.test(input3));
  assertEquals(matchedTransition3?.to, "separator");
});

Deno.test("ScopeNode - trigger priority order: incomplete scope has fallback priority", () => {
  const node = new ScopeNode(mockScopes);

  // "(api" should match scope trigger (priority 2, fallback)
  const input1 = "(api";
  const matchedTransition1 = node.next.find((t) => t.trigger.test(input1));
  assertEquals(matchedTransition1?.to, "scope");

  // "(" should match scope trigger
  const input2 = "(";
  const matchedTransition2 = node.next.find((t) => t.trigger.test(input2));
  assertEquals(matchedTransition2?.to, "scope");

  // "(u" should match scope trigger
  const input3 = "(u";
  const matchedTransition3 = node.next.find((t) => t.trigger.test(input3));
  assertEquals(matchedTransition3?.to, "scope");
});

Deno.test("ScopeNode - trigger priority order: complete beats incomplete", () => {
  const node = new ScopeNode(mockScopes);

  // "(api):" should match complete scope trigger, not incomplete
  const input = "(api):";

  // Check that complete scope trigger matches
  const completeTrigger = node.next[0];
  assertEquals(completeTrigger.to, "separator");
  assertEquals(completeTrigger.trigger.test(input), true);

  // Check that incomplete scope trigger also matches (but should be ignored)
  const incompleteTrigger = node.next[1];
  assertEquals(incompleteTrigger.to, "scope");
  assertEquals(incompleteTrigger.trigger.test(input), true);

  // The first matching trigger should be complete scope
  const matchedTransition = node.next.find((t) => t.trigger.test(input));
  assertEquals(matchedTransition?.to, "separator");
});

Deno.test("ScopeNode - trigger priority order: requires closing paren for separator", () => {
  const node = new ScopeNode(mockScopes);

  // "(api" (no closing paren) should NOT match separator trigger
  const input = "(api";

  const separatorTrigger = node.next[0];
  assertEquals(separatorTrigger.to, "separator");
  assertEquals(separatorTrigger.trigger.test(input), false);

  // Should match incomplete trigger instead
  const matchedTransition = node.next.find((t) => t.trigger.test(input));
  assertEquals(matchedTransition?.to, "scope");
});

Deno.test("ScopeNode - trigger priority order: requires separator lookahead", () => {
  const node = new ScopeNode(mockScopes);

  // "(api)" (no : or !:) should NOT match separator trigger
  const input = "(api)";

  const separatorTrigger = node.next[0];
  assertEquals(separatorTrigger.to, "separator");
  assertEquals(separatorTrigger.trigger.test(input), false);

  // Should match incomplete trigger instead (because it matches opening paren)
  const matchedTransition = node.next.find((t) => t.trigger.test(input));
  assertEquals(matchedTransition?.to, "scope");
});

Deno.test("ScopeNode - trigger priority order: all transitions with various inputs", () => {
  const node = new ScopeNode(mockScopes);

  const testCases = [
    { input: "(api):", expected: "separator" },
    { input: "(ui)!:", expected: "separator" },
    { input: "(core): ", expected: "separator" },
    { input: "(api-client)!:", expected: "separator" },
    { input: "(api", expected: "scope" },
    { input: "(u", expected: "scope" },
    { input: "(", expected: "scope" },
    { input: "(api)", expected: "scope" }, // No separator lookahead
    { input: "(ui) ", expected: "scope" }, // No separator lookahead
    { input: "(core)!", expected: "scope" }, // No : after !
    { input: "(api-", expected: "scope" },
    { input: "(ui/button", expected: "scope" },
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

Deno.test("ScopeNode - trigger priority order: breaking change separator", () => {
  const node = new ScopeNode(mockScopes);

  // Both ":" and "!:" should match separator trigger
  const testCases = [
    "(api):",
    "(api)!:",
    "(ui):",
    "(ui)!:",
    "(core):",
    "(core)!:",
  ];

  for (const input of testCases) {
    const matchedTransition = node.next.find((t) => t.trigger.test(input));
    assertEquals(
      matchedTransition?.to,
      "separator",
      `Input "${input}" should transition to separator`,
    );
  }
});

Deno.test("ScopeNode - complex scope names", () => {
  const node = new ScopeNode(mockScopes);
  const completeTrigger = node.next.find((t) => t.to === "separator")!.trigger;
  const incompleteTrigger = node.next.find((t) => t.to === "scope")!.trigger;

  // Multi-word scopes (with hyphens)
  assertEquals(completeTrigger.test("(api-client):"), true);
  assertEquals(incompleteTrigger.test("(api-client"), true);

  // Scopes with numbers
  assertEquals(completeTrigger.test("(v2):"), true);
  assertEquals(incompleteTrigger.test("(v2"), true);

  // Scopes with slashes
  assertEquals(completeTrigger.test("(ui/button):"), true);
  assertEquals(incompleteTrigger.test("(ui/button"), true);
});

Deno.test("ScopeNode - edge cases: empty scope", () => {
  const node = new ScopeNode(mockScopes);
  const completeTrigger = node.next.find((t) => t.to === "separator")!.trigger;
  const incompleteTrigger = node.next.find((t) => t.to === "scope")!.trigger;

  // Empty scope with separator should NOT match complete trigger
  // (requires at least one character: [^)]+)
  assertEquals(completeTrigger.test("():"), false);

  // Empty scope (just opening paren) should match incomplete trigger
  assertEquals(incompleteTrigger.test("("), true);
});

Deno.test("ScopeNode - edge cases: scope with special characters", () => {
  const node = new ScopeNode(mockScopes);
  const completeTrigger = node.next.find((t) => t.to === "separator")!.trigger;
  const incompleteTrigger = node.next.find((t) => t.to === "scope")!.trigger;

  // Scopes can contain any character except ')'
  const specialChars = [
    "(api@v2):",
    "(ui#123):",
    "(core$main)!:",
    "(test_case):",
  ];

  for (const input of specialChars) {
    assertEquals(
      completeTrigger.test(input),
      true,
      `"${input}" should match complete scope trigger`,
    );
  }

  // Incomplete versions
  const incompleteSpecialChars = [
    "(api@v2",
    "(ui#123",
    "(core$main",
    "(test_case",
  ];

  for (const input of incompleteSpecialChars) {
    assertEquals(
      incompleteTrigger.test(input),
      true,
      `"${input}" should match incomplete scope trigger`,
    );
  }
});

Deno.test("ScopeNode - edge cases: nested parentheses", () => {
  const node = new ScopeNode(mockScopes);
  const completeTrigger = node.next.find((t) => t.to === "separator")!.trigger;

  // The regex [^)]+ stops at the first closing paren
  // So "(api(nested)):" will match up to the first ")"
  const match1 = "(api(nested)):".match(completeTrigger);
  // This matches "(api(" because [^)]+ stops at the first ")"
  // Actually, this won't match at all because there's no ")" followed by !?:
  // Let's test what actually happens:

  // "(a):" should match
  const match2 = "(a):".match(completeTrigger);
  assertEquals(match2?.[0], "(a)");

  // "(api(nested)):" - the regex will match "(api(" up to first ")"
  // But since the lookahead requires !?: after ")", it won't match
  // because after first ")" comes "(", not ":"
  assertEquals(completeTrigger.test("(api(nested)):"), false);

  // Simple scopes work fine
  assertEquals(completeTrigger.test("(simple):"), true);
});

Deno.test("ScopeNode - edge cases: scope with spaces", () => {
  const node = new ScopeNode(mockScopes);
  const completeTrigger = node.next.find((t) => t.to === "separator")!.trigger;
  const incompleteTrigger = node.next.find((t) => t.to === "scope")!.trigger;

  // Spaces are allowed in scope names
  assertEquals(completeTrigger.test("(api client):"), true);
  assertEquals(incompleteTrigger.test("(api client"), true);

  const match = "(ui component):".match(completeTrigger);
  assertEquals(match?.[0], "(ui component)");
});

Deno.test("ScopeNode - edge cases: very long scope names", () => {
  const node = new ScopeNode(mockScopes);
  const completeTrigger = node.next.find((t) => t.to === "separator")!.trigger;

  // Long scope names should work
  const longScope =
    "(very-long-scope-name-with-multiple-segments-and-details)!:";
  assertEquals(completeTrigger.test(longScope), true);

  const match = longScope.match(completeTrigger);
  assertEquals(
    match?.[0],
    "(very-long-scope-name-with-multiple-segments-and-details)",
  );
});

Deno.test("ScopeNode - edge cases: unicode in scope names", () => {
  const node = new ScopeNode(mockScopes);
  const completeTrigger = node.next.find((t) => t.to === "separator")!.trigger;
  const incompleteTrigger = node.next.find((t) => t.to === "scope")!.trigger;

  // Unicode characters should work
  assertEquals(completeTrigger.test("(日本語):"), true);
  assertEquals(incompleteTrigger.test("(日本語"), true);

  assertEquals(completeTrigger.test("(🚀):"), true);
  assertEquals(incompleteTrigger.test("(🚀"), true);

  const match = "(機能追加)!:".match(completeTrigger);
  assertEquals(match?.[0], "(機能追加)");
});
