import type { Suggestion } from "../../type.ts";

/**
 * Form state: mode and focus management
 */
export type FormState = {
  mode: "normal" | "ai";
  focus: "header" | "body" | "footer";
};

/**
 * Header state: with suggestion functionality
 */
export type HeaderState = {
  value: string;
  cursor: number;
  suggestion: Suggestion[];
  filteredSuggestion: Suggestion[];
  suggestionIndex: number | undefined;
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
