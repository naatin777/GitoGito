import { assertEquals } from "@std/assert";
import type { CommitDecoratorContext } from "./commit-decorator.ts";
import {
  breakingChangeDecorator,
  draftPrefixDecorator,
  typeEmojiDecorator,
  wipPrefixDecorator,
} from "./builtin-decorators.ts";

// Helper to create test context
function createContext(
  overrides: Partial<CommitDecoratorContext> = {},
): CommitDecoratorContext {
  return {
    headerText: "",
    type: "",
    scope: "",
    hasBreakingChange: false,
    description: "",
    flags: {},
    cursorPosition: 0,
    ...overrides,
  };
}

Deno.test("wipPrefixDecorator - matches when wip flag is true", () => {
  const context = createContext({ flags: { wip: true } });

  assertEquals(wipPrefixDecorator.matcher(context), true);
  assertEquals(wipPrefixDecorator.generator(context), "WIP: ");
});

Deno.test("wipPrefixDecorator - does not match when wip flag is false", () => {
  const context = createContext({ flags: { wip: false } });

  assertEquals(wipPrefixDecorator.matcher(context), false);
});

Deno.test("wipPrefixDecorator - does not match when no flags", () => {
  const context = createContext({ flags: {} });

  assertEquals(wipPrefixDecorator.matcher(context), false);
});

Deno.test("typeEmojiDecorator - matches feat type", () => {
  const context = createContext({ type: "feat" });

  assertEquals(typeEmojiDecorator.matcher(context), true);
  assertEquals(typeEmojiDecorator.generator(context), "✨ ");
});

Deno.test("typeEmojiDecorator - matches fix type", () => {
  const context = createContext({ type: "fix" });

  assertEquals(typeEmojiDecorator.matcher(context), true);
  assertEquals(typeEmojiDecorator.generator(context), "🐛 ");
});

Deno.test("typeEmojiDecorator - matches refactor type", () => {
  const context = createContext({ type: "refactor" });

  assertEquals(typeEmojiDecorator.matcher(context), true);
  assertEquals(typeEmojiDecorator.generator(context), "♻️ ");
});

Deno.test("typeEmojiDecorator - does not match unknown type", () => {
  const context = createContext({ type: "custom" });

  assertEquals(typeEmojiDecorator.matcher(context), false);
});

Deno.test("typeEmojiDecorator - does not match empty type", () => {
  const context = createContext({ type: "" });

  assertEquals(typeEmojiDecorator.matcher(context), false);
});

Deno.test("typeEmojiDecorator - all types have correct emoji", () => {
  const expectedEmojis: Record<string, string> = {
    feat: "✨ ",
    fix: "🐛 ",
    docs: "📝 ",
    style: "💄 ",
    refactor: "♻️ ",
    perf: "⚡️ ",
    test: "✅ ",
    build: "👷 ",
    ci: "💚 ",
    chore: "🔧 ",
    revert: "⏪ ",
  };

  for (const [type, expectedEmoji] of Object.entries(expectedEmojis)) {
    const context = createContext({ type });

    assertEquals(
      typeEmojiDecorator.matcher(context),
      true,
      `Type "${type}" should match`,
    );
    assertEquals(
      typeEmojiDecorator.generator(context),
      expectedEmoji,
      `Type "${type}" should generate "${expectedEmoji}"`,
    );
  }
});

Deno.test("breakingChangeDecorator - matches when hasBreakingChange is true", () => {
  const context = createContext({ hasBreakingChange: true });

  assertEquals(breakingChangeDecorator.matcher(context), true);
  assertEquals(breakingChangeDecorator.generator(context), "💥 ");
});

Deno.test("breakingChangeDecorator - does not match when hasBreakingChange is false", () => {
  const context = createContext({ hasBreakingChange: false });

  assertEquals(breakingChangeDecorator.matcher(context), false);
});

Deno.test("draftPrefixDecorator - matches when draft flag is true", () => {
  const context = createContext({ flags: { draft: true } });

  assertEquals(draftPrefixDecorator.matcher(context), true);
  assertEquals(draftPrefixDecorator.generator(context), "[DRAFT] ");
});

Deno.test("draftPrefixDecorator - does not match when draft flag is false", () => {
  const context = createContext({ flags: { draft: false } });

  assertEquals(draftPrefixDecorator.matcher(context), false);
});

Deno.test("decorator priorities are correct", () => {
  // WIP and Draft should have highest priority (100)
  assertEquals(wipPrefixDecorator.priority, 100);
  assertEquals(draftPrefixDecorator.priority, 100);

  // Breaking change should be high but less than flags (95)
  assertEquals(breakingChangeDecorator.priority, 95);

  // Type emoji should be lower (90)
  assertEquals(typeEmojiDecorator.priority, 90);

  // This ensures order: WIP/Draft > Breaking > Emoji
  // Example: "WIP: 💥 ✨ feat!: add feature"
});
