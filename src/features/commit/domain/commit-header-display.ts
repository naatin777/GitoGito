/**
 * Commit header display utilities
 * Provides functions for formatting Ghost Text and Dropdown suggestions
 */

import { getDisplayWidth } from "../../../helpers/text/display-width.ts";
import type { CompletionSuggestion } from "./commit-header-completion.ts";

/**
 * Ghost Text style - the completion text shown inline after cursor
 */
export type GhostText = {
  /** The text to display (e.g., "ix" when user typed "f" and suggestion is "fix") */
  text: string;
  /** Whether the ghost text should be shown */
  visible: boolean;
};

/**
 * Dropdown item for list-based completion
 */
export type DropdownItem = {
  /** The complete value (e.g., "fix", "feat") */
  value: string;
  /** Description of what this option means */
  description: string;
  /** Whether this item is currently selected */
  selected: boolean;
};

/**
 * Character count display information
 */
export type CharacterCountDisplay = {
  /** Current character count */
  current: number;
  /** Maximum allowed characters */
  max: number;
  /** Formatted text (e.g., "1/50") */
  text: string;
  /** Whether the count exceeds the maximum */
  isOverLimit: boolean;
};

/**
 * Formats ghost text for inline completion (GitHub Copilot style)
 *
 * @param suggestion - The completion suggestion to display
 * @returns Ghost text object with the text to display
 *
 * @example
 * const suggestion = { value: "fix", inlineCompletion: "ix", description: "A bug fix" };
 * formatGhostText(suggestion)
 * // => { text: "ix", visible: true }
 *
 * formatGhostText(null)
 * // => { text: "", visible: false }
 */
export function formatGhostText(
  suggestion: CompletionSuggestion | null,
): GhostText {
  if (!suggestion || !suggestion.inlineCompletion) {
    return { text: "", visible: false };
  }

  return {
    text: suggestion.inlineCompletion,
    visible: true,
  };
}

/**
 * Formats suggestions for dropdown list display
 *
 * @param suggestions - List of completion suggestions
 * @param selectedIndex - Index of the currently selected item (undefined if none selected)
 * @returns Array of dropdown items ready for display
 *
 * @example
 * const suggestions = [
 *   { value: "fix", inlineCompletion: "ix", description: "A bug fix" },
 *   { value: "feat", inlineCompletion: "eat", description: "A new feature" }
 * ];
 * formatDropdownItems(suggestions, 0)
 * // => [
 * //   { value: "fix", description: "A bug fix", selected: true },
 * //   { value: "feat", description: "A new feature", selected: false }
 * // ]
 */
export function formatDropdownItems(
  suggestions: CompletionSuggestion[],
  selectedIndex?: number,
): DropdownItem[] {
  return suggestions.map((suggestion, index) => ({
    value: suggestion.value,
    description: suggestion.description,
    selected: selectedIndex !== undefined && index === selectedIndex,
  }));
}

/**
 * Formats character count display
 *
 * @param text - The current text to measure
 * @param maxLength - Maximum allowed character count (typically 50 for commit header)
 * @returns Character count display information
 *
 * @example
 * formatCharacterCount("fix: add login", 50)
 * // => { current: 15, max: 50, text: "15/50", isOverLimit: false }
 *
 * formatCharacterCount("fix: add very very very long description here", 50)
 * // => { current: 52, max: 50, text: "52/50", isOverLimit: true }
 *
 * // With unicode characters
 * formatCharacterCount("fix: 日本語", 50)
 * // => { current: 11, max: 50, text: "11/50", isOverLimit: false }
 */
export function formatCharacterCount(
  text: string,
  maxLength: number,
): CharacterCountDisplay {
  const current = getDisplayWidth(text);

  return {
    current,
    max: maxLength,
    text: `${current}/${maxLength}`,
    isOverLimit: current > maxLength,
  };
}

/**
 * Formats a dropdown item as a string for display
 * Arrow indicator (→) + value + description
 *
 * @param item - The dropdown item to format
 * @returns Formatted string for terminal display
 *
 * @example
 * const item = { value: "fix", description: "A bug fix", selected: false };
 * formatDropdownItemText(item)
 * // => "→ fix - A bug fix"
 *
 * const selectedItem = { value: "feat", description: "A new feature", selected: true };
 * formatDropdownItemText(selectedItem)
 * // => "→ feat - A new feature"  (with selected styling applied separately)
 */
export function formatDropdownItemText(item: DropdownItem): string {
  return `→ ${item.value} - ${item.description}`;
}

/**
 * Formats the header input with ghost text
 *
 * @param userInput - The text that user has typed
 * @param ghostText - The ghost text to append
 * @returns Object with user input and ghost text parts
 *
 * @example
 * formatHeaderWithGhostText("f", { text: "ix", visible: true })
 * // => { userPart: "f", ghostPart: "ix" }
 *
 * formatHeaderWithGhostText("fix", { text: "", visible: false })
 * // => { userPart: "fix", ghostPart: "" }
 */
export function formatHeaderWithGhostText(
  userInput: string,
  ghostText: GhostText,
): {
  userPart: string;
  ghostPart: string;
} {
  return {
    userPart: userInput,
    ghostPart: ghostText.visible ? ghostText.text : "",
  };
}
