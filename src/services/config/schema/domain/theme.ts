import { z } from "zod";

export const ThemeConfigSchema = z.object({
  mode: z.enum(["dark", "light", "custom"]),
});

export type ThemeConfig = z.infer<typeof ThemeConfigSchema>;

export const DEFAULT_THEME_CONFIG: ThemeConfig = {
  mode: "dark",
} as const;
