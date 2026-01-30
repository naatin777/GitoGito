import { z } from "zod";

export const ColorConfigSchema = z.object({
  primary: z.string(),
});

export type ColorConfig = z.infer<typeof ColorConfigSchema>;

export const DEFAULT_COLOR_CONFIG: ColorConfig = {
  primary: "#007bff",
} as const;
