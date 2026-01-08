import { assertEquals } from "@std/assert";
import {
  applyDecorators,
  calculateDecoratedCursorPosition,
  type CommitDecorator,
  type CommitDecoratorContext,
  decoratorRegistry,
  registerDecorator,
} from "./commit-decorator.ts";

// Helper to create test context
function createTestContext(
  overrides: Partial<CommitDecoratorContext> = {},
): CommitDecoratorContext {
  return {
    headerText: "fix: bug",
    type: "fix",
    scope: "",
    hasBreakingChange: false,
    description: "bug",
    flags: {},
    cursorPosition: 0,
    ...overrides,
  };
}

// Clear registry before each test
function setupTest() {
  decoratorRegistry.clear();
}

Deno.test("registerDecorator - adds decorator to registry", () => {
  setupTest();

  const decorator: CommitDecorator = {
    id: "test-decorator",
    position: "prefix",
    priority: 50,
    matcher: () => true,
    generator: () => "TEST: ",
  };

  registerDecorator(decorator);

  assertEquals(decoratorRegistry.get("test-decorator"), decorator);
});

Deno.test("registerDecorator - sorts by priority", () => {
  setupTest();

  const lowPriority: CommitDecorator = {
    id: "low",
    position: "prefix",
    priority: 10,
    matcher: () => true,
    generator: () => "LOW ",
  };

  const highPriority: CommitDecorator = {
    id: "high",
    position: "prefix",
    priority: 100,
    matcher: () => true,
    generator: () => "HIGH ",
  };

  registerDecorator(lowPriority);
  registerDecorator(highPriority);

  const all = decoratorRegistry.getAll();
  assertEquals(all[0].id, "high");
  assertEquals(all[1].id, "low");
});

Deno.test("applyDecorators - no matching decorators", () => {
  setupTest();

  const decorator: CommitDecorator = {
    id: "never-match",
    position: "prefix",
    priority: 50,
    matcher: () => false,
    generator: () => "NEVER ",
  };

  registerDecorator(decorator);

  const context = createTestContext({ headerText: "fix: bug" });
  const result = applyDecorators(context);

  assertEquals(result, {
    prefixes: [],
    userText: "fix: bug",
    suffixes: [],
    fullText: "fix: bug",
    decorationRanges: [
      {
        start: 0,
        end: 8,
        editable: true,
        style: "normal",
      },
    ],
  });
});

Deno.test("applyDecorators - single prefix decorator", () => {
  setupTest();

  const decorator: CommitDecorator = {
    id: "wip",
    position: "prefix",
    priority: 50,
    matcher: (ctx) => ctx.flags.wip === true,
    generator: () => "WIP: ",
  };

  registerDecorator(decorator);

  const context = createTestContext({
    headerText: "fix: bug",
    flags: { wip: true },
  });

  const result = applyDecorators(context);

  assertEquals(result.prefixes, ["WIP: "]);
  assertEquals(result.userText, "fix: bug");
  assertEquals(result.suffixes, []);
  assertEquals(result.fullText, "WIP: fix: bug");

  // Check ranges
  assertEquals(result.decorationRanges.length, 2);

  // Prefix range
  assertEquals(result.decorationRanges[0], {
    start: 0,
    end: 5,
    editable: false,
    style: "dimmed",
  });

  // User text range
  assertEquals(result.decorationRanges[1], {
    start: 5,
    end: 13,
    editable: true,
    style: "normal",
  });
});

Deno.test("applyDecorators - multiple prefix decorators", () => {
  setupTest();

  const highPriority: CommitDecorator = {
    id: "high",
    position: "prefix",
    priority: 100,
    matcher: () => true,
    generator: () => "A ",
  };

  const lowPriority: CommitDecorator = {
    id: "low",
    position: "prefix",
    priority: 50,
    matcher: () => true,
    generator: () => "B ",
  };

  registerDecorator(highPriority);
  registerDecorator(lowPriority);

  const context = createTestContext({ headerText: "fix: bug" });
  const result = applyDecorators(context);

  // Higher priority should come first
  assertEquals(result.prefixes, ["A ", "B "]);
  assertEquals(result.fullText, "A B fix: bug");
});

Deno.test("applyDecorators - suffix decorator", () => {
  setupTest();

  const decorator: CommitDecorator = {
    id: "suffix-test",
    position: "suffix",
    priority: 50,
    matcher: () => true,
    generator: () => " [auto]",
  };

  registerDecorator(decorator);

  const context = createTestContext({ headerText: "fix: bug" });
  const result = applyDecorators(context);

  assertEquals(result.suffixes, [" [auto]"]);
  assertEquals(result.fullText, "fix: bug [auto]");

  // Check suffix range
  const suffixRange = result.decorationRanges.find((r) =>
    r.start === 8 && r.end === 15
  );
  assertEquals(suffixRange, {
    start: 8,
    end: 15,
    editable: false,
    style: "dimmed",
  });
});

Deno.test("applyDecorators - prefix and suffix decorators", () => {
  setupTest();

  const prefixDec: CommitDecorator = {
    id: "prefix",
    position: "prefix",
    priority: 50,
    matcher: () => true,
    generator: () => "[PRE] ",
  };

  const suffixDec: CommitDecorator = {
    id: "suffix",
    position: "suffix",
    priority: 50,
    matcher: () => true,
    generator: () => " [SUF]",
  };

  registerDecorator(prefixDec);
  registerDecorator(suffixDec);

  const context = createTestContext({ headerText: "fix: bug" });
  const result = applyDecorators(context);

  assertEquals(result.fullText, "[PRE] fix: bug [SUF]");
  assertEquals(result.decorationRanges.length, 3);
});

Deno.test("calculateDecoratedCursorPosition - in editable region", () => {
  const decorated = {
    prefixes: ["WIP: "],
    userText: "fix: bug",
    suffixes: [],
    fullText: "WIP: fix: bug",
    decorationRanges: [],
  };

  // Cursor at position 7 (absolute) = position 2 (relative, in "fix")
  const result = calculateDecoratedCursorPosition(decorated, 7);

  assertEquals(result, {
    absolutePosition: 7,
    relativePosition: 2,
    inEditableRegion: true,
  });
});

Deno.test("calculateDecoratedCursorPosition - clamps to start of editable region", () => {
  const decorated = {
    prefixes: ["WIP: "],
    userText: "fix: bug",
    suffixes: [],
    fullText: "WIP: fix: bug",
    decorationRanges: [],
  };

  // Cursor at position 2 (in prefix) should clamp to 5 (start of editable)
  const result = calculateDecoratedCursorPosition(decorated, 2);

  assertEquals(result, {
    absolutePosition: 5,
    relativePosition: 0,
    inEditableRegion: true,
  });
});

Deno.test("calculateDecoratedCursorPosition - clamps to end of editable region", () => {
  const decorated = {
    prefixes: ["WIP: "],
    userText: "fix: bug",
    suffixes: [" [auto]"],
    fullText: "WIP: fix: bug [auto]",
    decorationRanges: [],
  };

  // Cursor at position 20 (in suffix) should clamp to 13 (end of editable)
  const result = calculateDecoratedCursorPosition(decorated, 20);

  assertEquals(result, {
    absolutePosition: 13,
    relativePosition: 8,
    inEditableRegion: true,
  });
});

Deno.test("unregisterDecorator - removes decorator", () => {
  setupTest();

  const decorator: CommitDecorator = {
    id: "removable",
    position: "prefix",
    priority: 50,
    matcher: () => true,
    generator: () => "REMOVE ",
  };

  registerDecorator(decorator);
  assertEquals(decoratorRegistry.get("removable"), decorator);

  const removed = decoratorRegistry.unregister("removable");
  assertEquals(removed, true);
  assertEquals(decoratorRegistry.get("removable"), undefined);
});

Deno.test("unregisterDecorator - returns false for non-existent", () => {
  setupTest();

  const removed = decoratorRegistry.unregister("does-not-exist");
  assertEquals(removed, false);
});
