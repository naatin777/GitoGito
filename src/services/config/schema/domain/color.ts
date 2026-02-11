import { z } from "zod";

export const ColorConfigSchema = z.object({
  primary: z.string().describe("Primary color used by the CLI theme."),
  text: z.string().describe("Text color used by the CLI theme."),
}).describe("Color configuration.");

export type ColorConfig = z.infer<typeof ColorConfigSchema>;

export const DEFAULT_COLOR_CONFIG: ColorConfig = {
  primary: "#007bff",
  text: "#ffffff",
} as const;
