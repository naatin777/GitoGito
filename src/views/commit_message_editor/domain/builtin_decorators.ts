/**
 * Built-in commit message decorators
 */

import type { CommitDecorator } from "./commit_decorator.ts";

/**
 * WIP Prefix Decorator
 * Adds "WIP: " prefix when -w flag is used
 */
export const wipPrefixDecorator: CommitDecorator = {
  id: "wip-prefix",
  position: "prefix",
  priority: 100,
  matcher: (context) => context.flags.wip === true,
  generator: () => "WIP: ",
};

/**
 * Type emoji mapping for conventional commits
 */
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

/**
 * Type Emoji Decorator
 * Adds emoji prefix based on conventional commit type
 */
export const typeEmojiDecorator: CommitDecorator = {
  id: "type-emoji",
  position: "prefix",
  priority: 90,
  matcher: (context) => {
    // Only apply if type exists in our map
    return context.type.length > 0 && context.type in TYPE_EMOJI_MAP;
  },
  generator: (context) => {
    const emoji = TYPE_EMOJI_MAP[context.type];
    return emoji ? emoji + " " : "";
  },
};

/**
 * Breaking Change Decorator
 * Adds "💥 " prefix when breaking change indicator (!) is present
 */
export const breakingChangeDecorator: CommitDecorator = {
  id: "breaking-change-indicator",
  position: "prefix",
  priority: 95,
  matcher: (context) => context.hasBreakingChange,
  generator: () => "💥 ",
};

/**
 * Draft Prefix Decorator
 * Adds "[DRAFT] " prefix when --draft flag is used
 */
export const draftPrefixDecorator: CommitDecorator = {
  id: "draft-prefix",
  position: "prefix",
  priority: 100,
  matcher: (context) => context.flags.draft === true,
  generator: () => "[DRAFT] ",
};

/**
 * All built-in decorators
 */
export const BUILTIN_DECORATORS: CommitDecorator[] = [
  wipPrefixDecorator,
  typeEmojiDecorator,
  breakingChangeDecorator,
  draftPrefixDecorator,
];

/**
 * Register all built-in decorators
 */
export function registerBuiltinDecorators(
  registry: { register: (decorator: CommitDecorator) => void },
): void {
  for (const decorator of BUILTIN_DECORATORS) {
    registry.register(decorator);
  }
}
