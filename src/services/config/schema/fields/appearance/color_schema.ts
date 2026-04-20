import z from "zod";
import { AnsiSchemaKeyof } from "./ansi_schema";

export const HexColorSchema = z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
export const ColorSchema = z.union([HexColorSchema, z.enum(AnsiSchemaKeyof)])

export const AppColorSchema = z.object({
  // --- 1. Base Structure ---
  surface: ColorSchema.describe("Panel background (e.g., ANSI 8: Bright Black)"),
  inputBackground: ColorSchema.describe("Input field background (e.g., ANSI 0: Black)"),
  border: ColorSchema.describe("Default border color (e.g., ANSI 7: White)"),
  divider: ColorSchema.describe("Separator/Divider color (e.g., ANSI 8: Bright Black)"),
  text: ColorSchema.describe("Base text color (e.g., ANSI 7: White)"),

  // --- 2. Semantic & Status ---
  error: ColorSchema.describe("Error/Fail color (e.g., ANSI 1: Red)"),
  success: ColorSchema.describe("Success/Pass color (e.g., ANSI 2: Green)"),
  warning: ColorSchema.describe("Warning/Warn color (e.g., ANSI 3: Yellow)"),
  info: ColorSchema.describe("Info/Command color (e.g., ANSI 6: Cyan)"),

  // --- 3. Interactive & Accent ---
  primary: ColorSchema.describe("Primary brand color (e.g., ANSI 4: Blue)"),
  focus: ColorSchema.describe("Focus background (e.g., ANSI 12: Bright Blue)"),
  selected: ColorSchema.describe("Selection background (e.g., ANSI 14: Bright Cyan)"),
  borderFocus: ColorSchema.describe("Focused border color (e.g., ANSI 15: Bright White)"),
}).describe("Color configuration for the CLI theme.");

export const BackgroundColorSchema = ColorSchema.optional().describe("Background color configuration for the CLI theme.");
