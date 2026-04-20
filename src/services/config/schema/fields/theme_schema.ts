import { z } from "zod";

export const ColorConfigSchema = z.object({
  backgroundColor: z.string().optional().describe("Background color used by the CLI theme."),
  surface: z.string().describe("Background color for panels, modals, and floating elements."),
  inputBackground: z.string().describe("Background color for text input fields."),
  text: z.string().describe("Base text color. Use DIM modifier for muted/disabled text."),
  primary: z.string().describe("Primary color used by the CLI theme."),
  focus: z.string().describe("Background color for focused elements."),
  selected: z.string().describe("Background color for selected items in lists or menus."),
  border: z.string().describe("Border color used by the CLI theme."),
  borderFocus: z.string().describe("Border color for focused elements."),
  divider: z.string().describe("Color for separators and dividers between panes."),
  error: z.string().describe("Color for error messages and destructive actions."),
  warning: z.string().describe("Color for warnings and alerts."),
  success: z.string().describe("Color for success messages."),
  info: z.string().describe("Color for informational messages."),
  cursor: z.string().describe("Cursor color for text inputs."),
}).describe("Color configuration for the CLI theme.");

export type ColorConfig = z.infer<typeof ColorConfigSchema>;

export const DARK_THEME_COLORS: ColorConfig = {
  surface: "#1e1e1e",
  inputBackground: "#2d2d2d",
  text: "#ffffff",
  primary: "#007bff",
  focus: "#0056b3",
  selected: "#2b2b2b",
  border: "#ffffff",
  borderFocus: "#007bff",
  divider: "#333333",
  error: "#dc3545",
  warning: "#ffc107",
  success: "#28a745",
  info: "#17a2b8",
  cursor: "#007bff",
} as const;

export const SOLID_DARK_THEME_COLORS: ColorConfig = {
  ...DARK_THEME_COLORS,
  backgroundColor: "#000000",
} as const;

export const LIGHT_THEME_COLORS: ColorConfig = {
  surface: "#f8f9fa",
  inputBackground: "#e9ecef",
  text: "#111111",
  primary: "#0056b3",
  focus: "#cce5ff",
  selected: "#e2e3e5",
  border: "#111111",
  borderFocus: "#0056b3",
  divider: "#dee2e6",
  error: "#c82333",
  warning: "#e0a800",
  success: "#218838",
  info: "#138496",
  cursor: "#0056b3",
} as const;

export const SOLID_LIGHT_THEME_COLORS: ColorConfig = {
  ...LIGHT_THEME_COLORS,
  backgroundColor: "#ffffff",
} as const;

export const DEFAULT_COLOR_CONFIG: ColorConfig = SOLID_DARK_THEME_COLORS;

export const ThemeConfigSchema = z.object({
  mode: z.enum([
    "AdaptiveDark",
    "AdaptiveLight",
    "GenericDark",
    "GenericLight",
    "SolidDark",
    "SolidLight",
    "Custom"
  ]).describe(
    "Theme mode used by the CLI.",
  ),
  color: ColorConfigSchema.default(DEFAULT_COLOR_CONFIG).describe(
    "Color settings for the theme.",
  ),
}).describe("Theme configuration.");

export type ThemeConfig = z.infer<typeof ThemeConfigSchema>;

export const DEFAULT_THEME_CONFIG: ThemeConfig = {
  mode: "GenericLight",
  color: DEFAULT_COLOR_CONFIG,
} as const;
