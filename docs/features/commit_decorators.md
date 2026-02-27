# Commit Message Decorators

## Overview

Commit message decorators provide a flexible way to automatically add prefixes,
suffixes, or inline decorations to commit messages. These decorations are
displayed in a dimmed style and are non-editable, but they appear in the final
commit message.

## Use Cases

### 1. WIP Prefix with CLI Flag

When user runs `gitogito commit -w`, automatically add `WIP:` prefix:

```bash
$ gitogito commit -w

╭─────────────────────────────────────────────────────╮
│ Header ❯ WIP: fix login bug| (17/50)                │
│          ^^^^                                        │
│          (dimmed, non-editable)                      │
╰─────────────────────────────────────────────────────╯

# User types: "fix login bug"
# Display shows: "WIP: fix login bug" (WIP: is dimmed)
# Final commit: "WIP: fix login bug"
```

### 2. Emoji Auto-Decoration by Type

When user types a conventional commit type, automatically show corresponding
emoji:

```bash
# User types: "refactor"
╭─────────────────────────────────────────────────────╮
│ Header ❯ ♻️  refactor|                               │
│          ^^                                          │
│          (dimmed, non-editable)                      │
╰─────────────────────────────────────────────────────╯

# If user changes "refactor" to "fix"
╭─────────────────────────────────────────────────────╮
│ Header ❯ 🐛 fix|                                    │
│          ^^                                          │
│          (emoji updates automatically)               │
╰─────────────────────────────────────────────────────╯

# If user changes to unknown type "custom"
╭─────────────────────────────────────────────────────╮
│ Header ❯ custom|                                     │
│          (no emoji, since not registered)            │
╰─────────────────────────────────────────────────────╯
```

### 3. Scope-based Decorations

Add decorations based on detected scope:

```bash
# User types: "feat(api)"
╭─────────────────────────────────────────────────────╮
│ Header ❯ ✨ feat(🌐 api)|                           │
│          ^^      ^^                                  │
│          (both dimmed, non-editable)                 │
╰─────────────────────────────────────────────────────╯
```

## Architecture: Decorator Registry Pattern

### Core Concept

Use a **registry pattern** instead of hardcoded if-statements to allow
extensibility:

```typescript
// Decorator interface
type CommitDecorator = {
  id: string;
  position: "prefix" | "inline" | "suffix";

  // Determine if this decorator should be applied
  matcher: (context: CommitContext) => boolean;

  // Generate the decoration text
  generator: (context: CommitContext) => string;

  // Priority (higher = applied first)
  priority: number;
};

// Example context passed to decorators
type CommitContext = {
  // Current header text (user's editable input)
  headerText: string;

  // Parsed conventional commit parts
  type: string;
  scope: string;
  hasBreakingChange: boolean;
  description: string;

  // CLI flags
  flags: {
    wip?: boolean;
    draft?: boolean;
    // ... other flags
  };

  // Current cursor position
  cursorPosition: number;
};
```

### Decorator Registry

```typescript
// Global registry
const decoratorRegistry: CommitDecorator[] = [];

// Register a decorator
function registerDecorator(decorator: CommitDecorator): void {
  decoratorRegistry.push(decorator);
  // Sort by priority
  decoratorRegistry.sort((a, b) => b.priority - a.priority);
}

// Apply all decorators
function applyDecorators(context: CommitContext): DecoratedMessage {
  const prefixes: string[] = [];
  const inlines: Map<number, string> = new Map();
  const suffixes: string[] = [];

  for (const decorator of decoratorRegistry) {
    if (!decorator.matcher(context)) continue;

    const decoration = decorator.generator(context);

    switch (decorator.position) {
      case "prefix":
        prefixes.push(decoration);
        break;
      case "inline":
        // Inline decorations need position info
        // This is more complex, may need different approach
        break;
      case "suffix":
        suffixes.push(decoration);
        break;
    }
  }

  return {
    prefixes,
    userText: context.headerText,
    suffixes,
    // Decorations metadata for rendering
    decorationRanges: calculateRanges(prefixes, context.headerText, suffixes),
  };
}
```

## Built-in Decorators

### 1. WIP Prefix Decorator

```typescript
registerDecorator({
  id: "wip-prefix",
  position: "prefix",
  priority: 100,
  matcher: (context) => context.flags.wip === true,
  generator: () => "WIP: ",
});
```

### 2. Type Emoji Decorator

```typescript
const TYPE_EMOJI_MAP: Record<string, string> = {
  feat: "✨",
  fix: "🐛",
  docs: "📝",
  style: "💄",
  refactor: "♻️",
  perf: "⚡️",
  test: "✅",
  build: "👷",
  ci: "💚",
  chore: "🔧",
  revert: "⏪",
};

registerDecorator({
  id: "type-emoji",
  position: "prefix",
  priority: 90,
  matcher: (context) => {
    // Only apply if type exists in our map
    return context.type in TYPE_EMOJI_MAP;
  },
  generator: (context) => {
    return TYPE_EMOJI_MAP[context.type] + " ";
  },
});
```

### 3. Breaking Change Decorator

```typescript
registerDecorator({
  id: "breaking-change-indicator",
  position: "prefix",
  priority: 95,
  matcher: (context) => context.hasBreakingChange,
  generator: () => "💥 ",
});
```

## Display Format

### Decorated Message Structure

```typescript
type DecoratedMessage = {
  // All prefix decorations (non-editable)
  prefixes: string[];

  // User's actual input (editable)
  userText: string;

  // All suffix decorations (non-editable)
  suffixes: string[];

  // Metadata for rendering
  decorationRanges: DecoratedRange[];
};

type DecoratedRange = {
  start: number; // Character index in full message
  end: number; // Character index in full message
  editable: boolean;
  style: "dimmed" | "normal";
};
```

### Rendering Logic

When displaying in TUI:

```typescript
function renderDecoratedMessage(decorated: DecoratedMessage): ReactNode {
  return (
    <>
      {/* Non-editable prefixes (dimmed) */}
      <Text dimColor>{decorated.prefixes.join("")}</Text>

      {/* Editable user text (normal) */}
      <Text>{decorated.userText}</Text>

      {/* Non-editable suffixes (dimmed) */}
      <Text dimColor>{decorated.suffixes.join("")}</Text>
    </>
  );
}
```

### Cursor Positioning

The cursor should only move within the editable range:

```typescript
type CursorPosition = {
  // Absolute position in the full decorated message
  absolutePosition: number;

  // Relative position in user's editable text
  relativePosition: number;

  // Whether cursor is in editable region
  inEditableRegion: boolean;
};

function calculateCursorPosition(
  decorated: DecoratedMessage,
  cursorIndex: number,
): CursorPosition {
  const prefixLength = decorated.prefixes.join("").length;
  const userTextLength = decorated.userText.length;

  // Cursor should be clamped to editable region
  const clampedIndex = Math.max(
    prefixLength,
    Math.min(cursorIndex, prefixLength + userTextLength),
  );

  return {
    absolutePosition: clampedIndex,
    relativePosition: clampedIndex - prefixLength,
    inEditableRegion: clampedIndex >= prefixLength &&
      clampedIndex <= prefixLength + userTextLength,
  };
}
```

## State Management with Redux

### State Structure

```typescript
type CommitHeaderState = {
  // User's actual input (editable part only)
  value: string;

  // Cursor position in user's input (not absolute)
  cursor: number;

  // Applied decorators
  decorations: {
    prefixes: string[];
    suffixes: string[];
  };

  // Decorator configuration
  enabledDecorators: string[]; // IDs of enabled decorators

  // ... existing suggestion state
  suggestion: Suggestion[];
  filteredSuggestion: Suggestion[];
  suggestionIndex: number | undefined;
};
```

### Actions

```typescript
// Update decorators when context changes
function updateDecorators(state: CommitHeaderState, flags: CliFlags) {
  const context = {
    headerText: state.value,
    type: parseType(state.value),
    scope: parseScope(state.value),
    hasBreakingChange: parseBreakingChange(state.value),
    description: parseDescription(state.value),
    flags,
    cursorPosition: state.cursor,
  };

  const decorated = applyDecorators(context);
  state.decorations = {
    prefixes: decorated.prefixes,
    suffixes: decorated.suffixes,
  };
}

// Example reducer
headerType: ((state, action) => {
  const { char } = action.payload;

  // Update user's editable text
  typeChar(state, char);

  // Reapply decorators
  updateDecorators(state, currentFlags);

  // Update suggestions
  updateFilteredSuggestions(state);
});
```

## Configuration and Extensibility

### User Configuration File

Users can define custom decorators in `.gitogito/decorators.ts`:

```typescript
// .gitogito/decorators.ts
import { registerDecorator } from "gitogito/decorators";

// Custom decorator: add [URGENT] prefix for specific branches
registerDecorator({
  id: "urgent-hotfix",
  position: "prefix",
  priority: 110,
  matcher: (context) => {
    // Check if current branch is hotfix
    const branch = getCurrentBranch();
    return branch.startsWith("hotfix/");
  },
  generator: () => "[URGENT] ",
});

// Custom decorator: add scope emoji
registerDecorator({
  id: "custom-scope-emoji",
  position: "inline",
  priority: 85,
  matcher: (context) => context.scope === "api",
  generator: () => "🌐 ",
});
```

### Decorator Plugin System (Future)

```typescript
// Plugin interface
interface DecoratorPlugin {
  name: string;
  version: string;
  decorators: CommitDecorator[];

  // Lifecycle hooks
  onEnable?: () => void;
  onDisable?: () => void;
}

// Load plugin
function loadDecoratorPlugin(plugin: DecoratorPlugin): void {
  for (const decorator of plugin.decorators) {
    registerDecorator(decorator);
  }

  plugin.onEnable?.();
}
```

## Edge Cases and Considerations

### 1. Multiple Prefix Decorators

When multiple prefix decorators are active:

- Apply in priority order (higher priority first)
- Concatenate: `"💥 WIP: ✨ feat: add feature"`

### 2. Conflicting Decorators

If two decorators want to modify the same position:

- Priority wins
- Or allow both if they don't conflict

### 3. Copy/Paste Behavior

When user copies decorated text:

- Only copy the editable part? Or include decorations?
- Probably include decorations since they're part of final commit

### 4. Decoration Changes Mid-Edit

When user is typing and decoration changes:

- Cursor position should remain stable in editable region
- Example: typing "refactor" → "fix" changes emoji, but cursor stays at "fix|"

### 5. Character Count

Character count should include decorations since they're in final commit:

```
WIP: ✨ feat: add feature
└─────────── All counted
```

## Implementation Priority

1. **Phase 1: Core Infrastructure**
   - DecoratedMessage type
   - Basic rendering with dimmed style
   - Cursor position management

2. **Phase 2: Registry Pattern**
   - Decorator interface
   - Registry implementation
   - Apply decorators logic

3. **Phase 3: Built-in Decorators**
   - WIP prefix (`-w` flag)
   - Type emoji
   - Breaking change indicator

4. **Phase 4: User Configuration**
   - Load decorators from config file
   - Enable/disable decorators

5. **Phase 5: Plugin System (Future)**
   - Plugin interface
   - Dynamic loading
   - Marketplace/sharing

## Testing Strategy

### Unit Tests

```typescript
// Test decorator matching
Deno.test("WIP decorator matches when flag is true", () => {
  const decorator = wipPrefixDecorator;
  const context = { flags: { wip: true }, ... };

  assertEquals(decorator.matcher(context), true);
});

// Test decoration generation
Deno.test("Type emoji generates correct emoji", () => {
  const context = { type: "feat", ... };
  const result = typeEmojiDecorator.generator(context);

  assertEquals(result, "✨ ");
});

// Test cursor positioning
Deno.test("Cursor stays in editable region", () => {
  const decorated = {
    prefixes: ["WIP: "],
    userText: "fix bug",
    suffixes: [],
  };

  const cursor = calculateCursorPosition(decorated, 3);

  // Cursor at index 3 should clamp to start of editable region (after "WIP: ")
  assertEquals(cursor.relativePosition, 0);
});
```

### Integration Tests

- Test full typing workflow with decorations
- Test decoration updates on text change
- Test multiple decorators interaction

## Future Enhancements

### Dynamic Decorations

Decorations that change based on:

- Git status (e.g., show file count)
- Time of day (e.g., "🌙 Late night commit")
- Commit size (e.g., show +/- lines)

### AI-Powered Decorations

- Suggest emoji based on description
- Detect urgency/priority from text
- Categorize commits automatically

### Team Conventions

- Enforce team-specific prefixes
- Validate decoration patterns
- Sync decorators across team via config

## Related Documents

- [Commit UX Specification](./commit_ux.md) - Base commit editing experience
- [Configuration Guide](../development/configuration.md) - User configuration
