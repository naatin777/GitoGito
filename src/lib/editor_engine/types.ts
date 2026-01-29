export interface CompletionItem {
  matchValue: string;
  unmatchedValue: string;
  description: string;
}

export type StyleRole =
  | "primary" // Active/normal text (same as secondary for now)
  | "secondary" // Confirmed text (same as primary for now)
  | "ghost" // Completion preview (gray, not included in output)
  | "locked" // Non-editable triggers (future use)
  | "placeholder" // Empty state hint (future use)
  | "error" // Conflicts/errors (red, strikethrough)
  | "warn" // Warnings (yellow)
  | "meta"; // Character counter, metadata (gray)

export interface TextFragment {
  text: string;
  role: StyleRole;
  isEditable: boolean;
  isLocked: boolean;
  isIncludeInOutput: boolean;
  style?: {
    color?: string;
    bold?: boolean;
    dim?: boolean;
    underline?: boolean;
    italic?: boolean;
    strikethrough?: boolean;
    inverse?: boolean;
  };
}

export interface FragmentContext {
  value: string;
  isPrimary: boolean;
  selectIndex: number;
  completions: CompletionItem[];
}

export interface Transition<T> {
  to: keyof T & string;
  trigger: RegExp;
}
