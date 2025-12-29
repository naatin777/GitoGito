export const NORMAL_MODE_SHORTCUTS = [
  { key: "Tab", description: "Completion" },
  { key: "Ctrl+g", description: "Generate" },
  { key: "Esc", description: "Cancel" },
  { key: "Ctrl+s", description: "Commit" },
] as const;

export type NormalModeShortcuts = typeof NORMAL_MODE_SHORTCUTS[number];

export const AI_MODE_SHORTCUTS = [
  { key: "Tab", description: "Completion" },
  { key: "Esc", description: "Normal" },
] as const;

export type AiModeShortcuts = typeof AI_MODE_SHORTCUTS[number];
