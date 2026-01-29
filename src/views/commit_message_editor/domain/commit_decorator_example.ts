/**
 * Example usage of commit decorator system
 * This file demonstrates how to use decorators in practice
 */

import {
  applyDecorators,
  type CommitDecoratorContext,
  registerDecorator,
} from "./commit_decorator.ts";
import { registerBuiltinDecorators } from "./builtin_decorators.ts";
import { decoratorRegistry } from "./commit_decorator.ts";

// Example 1: Basic usage with WIP flag
function example1_WipFlag() {
  // Register built-in decorators
  registerBuiltinDecorators(decoratorRegistry);

  // Create context with WIP flag
  const context: CommitDecoratorContext = {
    headerText: "fix login bug",
    type: "fix",
    scope: "",
    hasBreakingChange: false,
    description: "fix login bug",
    flags: { wip: true },
    cursorPosition: 0,
  };

  // Apply decorators
  const decorated = applyDecorators(context);

  console.log("Example 1: WIP Flag");
  console.log("Full text:", decorated.fullText);
  // => "WIP: fix login bug"
  console.log("Prefixes:", decorated.prefixes);
  // => ["WIP: "]
  console.log("User text:", decorated.userText);
  // => "fix login bug"
  console.log("");
}

// Example 2: Type emoji decorator
function example2_TypeEmoji() {
  registerBuiltinDecorators(decoratorRegistry);

  const context: CommitDecoratorContext = {
    headerText: "refactor: clean up code",
    type: "refactor",
    scope: "",
    hasBreakingChange: false,
    description: "clean up code",
    flags: {},
    cursorPosition: 0,
  };

  const decorated = applyDecorators(context);

  console.log("Example 2: Type Emoji");
  console.log("Full text:", decorated.fullText);
  // => "♻️  refactor: clean up code"
  console.log("Emoji prefix:", decorated.prefixes[0]);
  // => "♻️  "
  console.log("");
}

// Example 3: Multiple decorators (WIP + Emoji + Breaking)
function example3_MultipleDecorators() {
  registerBuiltinDecorators(decoratorRegistry);

  const context: CommitDecoratorContext = {
    headerText: "feat!: new API",
    type: "feat",
    scope: "",
    hasBreakingChange: true,
    description: "new API",
    flags: { wip: true },
    cursorPosition: 0,
  };

  const decorated = applyDecorators(context);

  console.log("Example 3: Multiple Decorators");
  console.log("Full text:", decorated.fullText);
  // => "WIP: 💥 ✨ feat!: new API"
  console.log("All prefixes:", decorated.prefixes);
  // => ["WIP: ", "💥 ", "✨ "]
  console.log("");

  // Note: Order is by priority:
  // 1. WIP (priority: 100)
  // 2. Breaking change (priority: 95)
  // 3. Type emoji (priority: 90)
}

// Example 4: Custom decorator
function example4_CustomDecorator() {
  decoratorRegistry.clear();

  // Register a custom decorator for hotfix branches
  registerDecorator({
    id: "hotfix-urgent",
    position: "prefix",
    priority: 110, // Higher than WIP
    matcher: (context) => {
      // In real implementation, check git branch
      return context.flags.hotfix === true;
    },
    generator: () => "[URGENT] ",
  });

  const context: CommitDecoratorContext = {
    headerText: "fix critical bug",
    type: "fix",
    scope: "",
    hasBreakingChange: false,
    description: "fix critical bug",
    flags: { hotfix: true },
    cursorPosition: 0,
  };

  const decorated = applyDecorators(context);

  console.log("Example 4: Custom Decorator");
  console.log("Full text:", decorated.fullText);
  // => "[URGENT] fix critical bug"
  console.log("");
}

// Example 5: Understanding decoration ranges
function example5_DecorationRanges() {
  registerBuiltinDecorators(decoratorRegistry);

  const context: CommitDecoratorContext = {
    headerText: "fix: bug",
    type: "fix",
    scope: "",
    hasBreakingChange: false,
    description: "bug",
    flags: { wip: true },
    cursorPosition: 0,
  };

  const decorated = applyDecorators(context);

  console.log("Example 5: Decoration Ranges");
  console.log("Full text:", decorated.fullText);
  // => "WIP: fix: bug"
  console.log("Ranges:");

  for (const range of decorated.decorationRanges) {
    const text = decorated.fullText.slice(range.start, range.end);
    console.log(
      `  [${range.start}-${range.end}] "${text}" - editable: ${range.editable}, style: ${range.style}`,
    );
  }
  // Output:
  //   [0-5] "WIP: " - editable: false, style: dimmed
  //   [5-13] "fix: bug" - editable: true, style: normal
  console.log("");
}

// Example 6: Scope-based custom decorator
function example6_ScopeDecorator() {
  decoratorRegistry.clear();

  // Register scope emoji decorator
  const SCOPE_EMOJI: Record<string, string> = {
    api: "🌐",
    ui: "🎨",
    db: "🗄️",
    auth: "🔐",
  };

  registerDecorator({
    id: "scope-emoji",
    position: "prefix",
    priority: 85,
    matcher: (context) => context.scope in SCOPE_EMOJI,
    generator: (context) => SCOPE_EMOJI[context.scope] + " ",
  });

  const context: CommitDecoratorContext = {
    headerText: "feat(api): add endpoint",
    type: "feat",
    scope: "api",
    hasBreakingChange: false,
    description: "add endpoint",
    flags: {},
    cursorPosition: 0,
  };

  const decorated = applyDecorators(context);

  console.log("Example 6: Scope Decorator");
  console.log("Full text:", decorated.fullText);
  // => "🌐 feat(api): add endpoint"
  console.log("");
}

// Run all examples
if (import.meta.main) {
  console.log("=".repeat(50));
  console.log("Commit Decorator System Examples");
  console.log("=".repeat(50));
  console.log("");

  example1_WipFlag();
  example2_TypeEmoji();
  example3_MultipleDecorators();
  example4_CustomDecorator();
  example5_DecorationRanges();
  example6_ScopeDecorator();

  console.log("=".repeat(50));
  console.log("All examples completed!");
  console.log("=".repeat(50));
}
