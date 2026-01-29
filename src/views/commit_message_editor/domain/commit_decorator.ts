/**
 * Commit message decorator system
 * Provides extensible way to add prefixes, suffixes, and inline decorations
 * to commit messages based on context and CLI flags
 */

/**
 * Context passed to decorators for matching and generation
 */
export type CommitDecoratorContext = {
  /** Current header text (user's editable input) */
  headerText: string;

  /** Parsed conventional commit parts */
  type: string;
  scope: string;
  hasBreakingChange: boolean;
  description: string;

  /** CLI flags that may affect decorations */
  flags: {
    wip?: boolean;
    draft?: boolean;
    [key: string]: boolean | undefined;
  };

  /** Current cursor position in user's text */
  cursorPosition: number;
};

/**
 * Position where decoration should be applied
 */
export type DecoratorPosition = "prefix" | "inline" | "suffix";

/**
 * A single commit decorator that can add text to messages
 */
export type CommitDecorator = {
  /** Unique identifier for this decorator */
  id: string;

  /** Where to place the decoration */
  position: DecoratorPosition;

  /** Determine if this decorator should be applied */
  matcher: (context: CommitDecoratorContext) => boolean;

  /** Generate the decoration text */
  generator: (context: CommitDecoratorContext) => string;

  /** Priority (higher = applied first, useful for ordering multiple decorators) */
  priority: number;
};

/**
 * Range information for decorated text
 */
export type DecoratedRange = {
  /** Starting character index in full decorated message */
  start: number;

  /** Ending character index in full decorated message */
  end: number;

  /** Whether this range is editable by user */
  editable: boolean;

  /** Visual style for rendering */
  style: "dimmed" | "normal";
};

/**
 * Result of applying decorators to a message
 */
export type DecoratedMessage = {
  /** All prefix decorations (non-editable) */
  prefixes: string[];

  /** User's actual input (editable) */
  userText: string;

  /** All suffix decorations (non-editable) */
  suffixes: string[];

  /** Full decorated message text */
  fullText: string;

  /** Ranges for rendering (which parts are editable/dimmed) */
  decorationRanges: DecoratedRange[];
};

/**
 * Cursor position information in decorated message
 */
export type DecoratedCursorPosition = {
  /** Absolute position in the full decorated message */
  absolutePosition: number;

  /** Relative position in user's editable text only */
  relativePosition: number;

  /** Whether cursor is currently in editable region */
  inEditableRegion: boolean;
};

/**
 * Global registry of commit decorators
 */
class DecoratorRegistry {
  private decorators: CommitDecorator[] = [];

  /**
   * Register a new decorator
   */
  register(decorator: CommitDecorator): void {
    // Check for duplicate IDs
    const existing = this.decorators.find((d) => d.id === decorator.id);
    if (existing) {
      console.warn(
        `Decorator with id "${decorator.id}" already exists. Replacing.`,
      );
      this.unregister(decorator.id);
    }

    this.decorators.push(decorator);

    // Sort by priority (higher first)
    this.decorators.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Unregister a decorator by ID
   */
  unregister(id: string): boolean {
    const index = this.decorators.findIndex((d) => d.id === id);
    if (index === -1) return false;

    this.decorators.splice(index, 1);
    return true;
  }

  /**
   * Get all registered decorators
   */
  getAll(): readonly CommitDecorator[] {
    return this.decorators;
  }

  /**
   * Get decorator by ID
   */
  get(id: string): CommitDecorator | undefined {
    return this.decorators.find((d) => d.id === id);
  }

  /**
   * Clear all decorators
   */
  clear(): void {
    this.decorators = [];
  }

  /**
   * Apply all matching decorators to a context
   */
  applyDecorators(context: CommitDecoratorContext): DecoratedMessage {
    const prefixes: string[] = [];
    const suffixes: string[] = [];

    // Apply each decorator that matches
    for (const decorator of this.decorators) {
      if (!decorator.matcher(context)) continue;

      const decoration = decorator.generator(context);

      switch (decorator.position) {
        case "prefix":
          prefixes.push(decoration);
          break;
        case "suffix":
          suffixes.push(decoration);
          break;
        case "inline":
          // Inline decorations are more complex - not implemented yet
          // May need position information from matcher
          console.warn(`Inline decorator "${decorator.id}" not yet supported`);
          break;
      }
    }

    // Build full text
    const prefixText = prefixes.join("");
    const suffixText = suffixes.join("");
    const fullText = prefixText + context.headerText + suffixText;

    // Calculate decoration ranges
    const ranges: DecoratedRange[] = [];

    // Prefix range (non-editable, dimmed)
    if (prefixText.length > 0) {
      ranges.push({
        start: 0,
        end: prefixText.length,
        editable: false,
        style: "dimmed",
      });
    }

    // User text range (editable, normal)
    ranges.push({
      start: prefixText.length,
      end: prefixText.length + context.headerText.length,
      editable: true,
      style: "normal",
    });

    // Suffix range (non-editable, dimmed)
    if (suffixText.length > 0) {
      ranges.push({
        start: prefixText.length + context.headerText.length,
        end: fullText.length,
        editable: false,
        style: "dimmed",
      });
    }

    return {
      prefixes,
      userText: context.headerText,
      suffixes,
      fullText,
      decorationRanges: ranges,
    };
  }
}

/**
 * Global singleton registry instance
 */
export const decoratorRegistry = new DecoratorRegistry();

/**
 * Register a decorator globally
 */
export function registerDecorator(decorator: CommitDecorator): void {
  decoratorRegistry.register(decorator);
}

/**
 * Unregister a decorator globally
 */
export function unregisterDecorator(id: string): boolean {
  return decoratorRegistry.unregister(id);
}

/**
 * Apply all registered decorators to a context
 */
export function applyDecorators(
  context: CommitDecoratorContext,
): DecoratedMessage {
  return decoratorRegistry.applyDecorators(context);
}

/**
 * Calculate cursor position in decorated message
 */
export function calculateDecoratedCursorPosition(
  decorated: DecoratedMessage,
  cursorIndex: number,
): DecoratedCursorPosition {
  const prefixLength = decorated.prefixes.join("").length;
  const userTextLength = decorated.userText.length;

  // Clamp cursor to editable region
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
