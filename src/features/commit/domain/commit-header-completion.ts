/**
 * Commit header completion utilities
 * Parses commit message header to provide context-aware completions
 */

export type CommitHeaderContext = {
  /** The part of message before cursor */
  beforeCursor: string;
  /** The part of message after cursor */
  afterCursor: string;
  /** Current editing position type */
  position: "type" | "scope" | "description" | "unknown";
  /** The current token being edited (for filtering suggestions) */
  currentToken: string;
  /** Whether breaking change indicator (!) exists */
  hasBreakingChange: boolean;
  /** The type part (e.g., "fix", "feat") */
  type: string;
  /** The scope part (e.g., "auth", "ui") */
  scope: string;
  /** Whether colon has been typed */
  hasColon: boolean;
};

/**
 * Parses commit header message and cursor position to determine
 * what kind of completion should be shown
 *
 * @param message - The full commit header message
 * @param cursor - Current cursor position (0-indexed)
 * @returns Context object with parsing results
 *
 * @example
 * parseCommitHeader("fix", 3)
 * // => { position: "type", currentToken: "fix", type: "fix", ... }
 *
 * parseCommitHeader("fix(au", 7)
 * // => { position: "scope", currentToken: "au", type: "fix", scope: "au", ... }
 *
 * parseCommitHeader("fix: add ", 9)
 * // => { position: "description", currentToken: "add ", type: "fix", ... }
 */
export function parseCommitHeader(
  message: string,
  cursor: number,
): CommitHeaderContext {
  const beforeCursor = message.slice(0, cursor);
  const afterCursor = message.slice(cursor);

  // Find special characters
  const openParenIndex = beforeCursor.indexOf("(");
  const closeParenIndex = beforeCursor.indexOf(")");
  const colonIndex = beforeCursor.indexOf(":");
  const bangIndex = beforeCursor.indexOf("!");

  let position: CommitHeaderContext["position"] = "unknown";
  let currentToken = "";
  let type = "";
  let scope = "";
  let hasBreakingChange = false;
  const hasColon = colonIndex !== -1;

  // Determine position and extract relevant parts
  if (colonIndex !== -1) {
    // Cursor is after colon, in description
    position = "description";
    const descriptionStart = colonIndex + 1;
    const descriptionBeforeCursor = beforeCursor.slice(descriptionStart);
    currentToken = descriptionBeforeCursor.trimStart();

    // Extract type and scope from prefix
    const prefix = beforeCursor.slice(0, colonIndex);
    const prefixParts = parsePrefix(prefix);
    type = prefixParts.type;
    scope = prefixParts.scope;
    hasBreakingChange = prefixParts.hasBreakingChange;
  } else if (
    openParenIndex !== -1 &&
    (closeParenIndex === -1 || cursor <= closeParenIndex)
  ) {
    // Cursor is in scope
    position = "scope";
    const scopeStart = openParenIndex + 1;
    const scopeEnd = closeParenIndex !== -1 ? closeParenIndex : cursor;
    currentToken = beforeCursor.slice(scopeStart, scopeEnd);
    type = beforeCursor.slice(0, openParenIndex).replace("!", "");
    scope = currentToken;
    hasBreakingChange = bangIndex !== -1 && bangIndex < openParenIndex;
  } else {
    // Cursor is in type
    position = "type";
    currentToken = beforeCursor.replace("!", "").replace("(", "").replace(
      ")",
      "",
    ).replace(":", "").trim();
    type = currentToken;
    hasBreakingChange = bangIndex !== -1;
  }

  return {
    beforeCursor,
    afterCursor,
    position,
    currentToken,
    hasBreakingChange,
    type,
    scope,
    hasColon,
  };
}

/**
 * Parses prefix part (before colon) of commit header
 */
function parsePrefix(prefix: string): {
  type: string;
  scope: string;
  hasBreakingChange: boolean;
} {
  let type = "";
  let scope = "";
  let hasBreakingChange = false;

  const openParenIndex = prefix.indexOf("(");
  const closeParenIndex = prefix.indexOf(")");
  const bangIndex = prefix.indexOf("!");

  if (openParenIndex !== -1 && closeParenIndex !== -1) {
    // Has scope
    type = prefix.slice(0, openParenIndex).replace("!", "").trim();
    scope = prefix.slice(openParenIndex + 1, closeParenIndex).trim();
    hasBreakingChange = bangIndex !== -1 && bangIndex < openParenIndex;
  } else {
    // No scope
    type = prefix.replace("!", "").trim();
    hasBreakingChange = bangIndex !== -1;
  }

  return { type, scope, hasBreakingChange };
}

/**
 * Generates completion suffix based on current context
 * Used to suggest what should come next after current input
 *
 * @param context - Parsed commit header context
 * @param availableScopes - List of available scopes for scope suggestions
 * @returns Array of suggested suffixes with descriptions
 *
 * @example
 * const ctx = parseCommitHeader("fix", 3);
 * getSuggestedSuffixes(ctx, [{ value: "src", description: "Source code" }])
 * // => [
 * //   { value: "fix:", description: "No scope" },
 * //   { value: "fix!:", description: "Breaking change" },
 * //   { value: "fix(src):", description: "Source code" },
 * // ]
 */
export function getSuggestedSuffixes(
  context: CommitHeaderContext,
  availableScopes: Array<{ value: string; description: string }> = [],
): Array<{ value: string; description: string }> {
  const suggestions: Array<{ value: string; description: string }> = [];

  if (context.position === "type") {
    const base = context.type;
    const bang = context.hasBreakingChange ? "!" : "";

    // Suggest colon without scope
    suggestions.push({
      value: `${base}${bang}:`,
      description: "No scope",
    });

    // Suggest breaking change marker (if not already present)
    if (!context.hasBreakingChange) {
      suggestions.push({
        value: `${base}!:`,
        description: "Breaking change",
      });
    }

    // Suggest each available scope with complete syntax
    for (const scope of availableScopes) {
      suggestions.push({
        value: `${base}${bang}(${scope.value}):`,
        description: scope.description,
      });
    }
  } else if (context.position === "scope") {
    const base = context.type;
    const scopePart = context.scope;
    const bang = context.hasBreakingChange ? "!" : "";
    // Suggest closing scope
    suggestions.push({
      value: `${base}${bang}(${scopePart}):`,
      description: "Close scope",
    });
  }

  return suggestions;
}

/**
 * Filters suggestions based on current input
 *
 * @param suggestions - List of all possible suggestions
 * @param filter - Current input to filter by
 * @returns Filtered suggestions that match the input
 */
export function filterSuggestions<T extends { value: string }>(
  suggestions: T[],
  filter: string,
): T[] {
  if (!filter) return suggestions;

  const lowerFilter = filter.toLowerCase();
  return suggestions.filter((s) =>
    s.value.toLowerCase().startsWith(lowerFilter)
  );
}

export type CompletionSuggestion = {
  /** The complete suggestion value */
  value: string;
  /** Description of what this suggestion means */
  description: string;
  /** The part that should be shown inline (after cursor) */
  inlineCompletion: string;
};

/**
 * Generates completion suggestions for commit header
 *
 * @param message - Current commit message
 * @param cursor - Current cursor position
 * @param availableTypes - List of available commit types
 * @param availableScopes - List of available scopes
 * @returns Object containing inline and list suggestions
 *
 * @example
 * getCompletionSuggestions("f", 1, [
 *   { value: "fix", description: "A bug fix" },
 *   { value: "feat", description: "A new feature" }
 * ], [])
 * // => {
 * //   inline: { value: "fix", inlineCompletion: "ix", description: "A bug fix" },
 * //   list: [
 * //     { value: "fix", inlineCompletion: "ix", description: "A bug fix" },
 * //     { value: "feat", inlineCompletion: "eat", description: "A new feature" }
 * //   ]
 * // }
 */
export function getCompletionSuggestions(
  message: string,
  cursor: number,
  availableTypes: Array<{ value: string; description: string }>,
  availableScopes: Array<{ value: string; description: string }>,
): {
  inline: CompletionSuggestion | null;
  list: CompletionSuggestion[];
} {
  const context = parseCommitHeader(message, cursor);
  const suggestions: CompletionSuggestion[] = [];

  if (context.position === "type") {
    // Filter and map type suggestions
    const filtered = filterSuggestions(availableTypes, context.currentToken);
    for (const type of filtered) {
      const inlineCompletion = type.value.slice(context.currentToken.length);
      suggestions.push({
        value: type.value,
        description: type.description,
        inlineCompletion,
      });
    }

    // Add suffix suggestions if exact type match exists
    const exactMatch = availableTypes.find((t) =>
      t.value === context.currentToken
    );
    if (exactMatch) {
      const suffixes = getSuggestedSuffixes(context, availableScopes);
      for (const suffix of suffixes) {
        const inlineCompletion = suffix.value.slice(
          context.currentToken.length,
        );
        suggestions.push({
          value: suffix.value,
          description: suffix.description,
          inlineCompletion,
        });
      }
    }
  } else if (context.position === "scope") {
    // Filter and map scope suggestions
    const filtered = filterSuggestions(availableScopes, context.currentToken);
    const base = context.type;
    const bang = context.hasBreakingChange ? "!" : "";

    for (const scope of filtered) {
      const fullValue = `${base}${bang}(${scope.value}):`;
      const inlineCompletion = scope.value.slice(context.currentToken.length) +
        "):";
      suggestions.push({
        value: fullValue,
        description: scope.description,
        inlineCompletion,
      });
    }

    // Add close scope suggestion
    if (context.currentToken.length > 0) {
      const closeValue = `${base}${bang}(${context.currentToken}):`;
      suggestions.push({
        value: closeValue,
        description: "Close scope",
        inlineCompletion: "):",
      });
    }
  } else if (context.position === "description") {
    // No autocomplete for description part (free text)
    return { inline: null, list: [] };
  }

  return {
    inline: suggestions.length > 0 ? suggestions[0] : null,
    list: suggestions,
  };
}

/**
 * Calculates the display position for inline completion
 *
 * @param message - Current message
 * @param cursor - Cursor position
 * @returns Position info for rendering inline completion
 */
export function getInlineCompletionPosition(
  message: string,
  cursor: number,
): {
  /** Text before cursor on current line */
  prefix: string;
  /** Text after cursor on current line */
  suffix: string;
  /** Column position where inline completion should start */
  column: number;
} {
  const beforeCursor = message.slice(0, cursor);
  const afterCursor = message.slice(cursor);

  // Find last newline before cursor
  const lastNewlineIndex = beforeCursor.lastIndexOf("\n");
  const prefix = lastNewlineIndex === -1
    ? beforeCursor
    : beforeCursor.slice(lastNewlineIndex + 1);

  // Find first newline after cursor
  const nextNewlineIndex = afterCursor.indexOf("\n");
  const suffix = nextNewlineIndex === -1
    ? afterCursor
    : afterCursor.slice(0, nextNewlineIndex);

  return {
    prefix,
    suffix,
    column: prefix.length,
  };
}
