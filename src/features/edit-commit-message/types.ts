import type { Suggestion } from "../../type.ts";
import type { DecoratedMessage } from "../../features/commit/domain/commit-decorator.ts";

/**
 * CLI flags that affect decorators
 */
export type CommitFlags = {
  wip?: boolean;
  draft?: boolean;
  emoji?: boolean; // Enable/disable emoji decorators
  [key: string]: boolean | undefined;
};

/**
 * Form state: mode and focus management
 */
export type FormState = {
  mode: "normal" | "ai";
  focus: "header" | "body" | "footer";
  flags: CommitFlags; // CLI flags for decorators
};

/**
 * Header state: with suggestion functionality and decorators
 */
export type HeaderState = {
  value: string;
  cursor: number;
  suggestion: Suggestion[];
  filteredSuggestion: Suggestion[];
  suggestionIndex: number | undefined;
  suggestionScrollOffset: number; // Scroll position for suggestion list window

  // Decorator state
  decorated: DecoratedMessage | null;
};

/**
 * Simple text field state: used for body and footer
 */
export type TextFieldState = {
  value: string;
  cursor: number;
};

/**
 * Combined edit commit message state
 */
export type EditCommitMessageState = {
  form: FormState;
  header: HeaderState;
  body: TextFieldState;
  footer: TextFieldState;
};
