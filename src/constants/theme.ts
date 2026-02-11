import type { ColorConfig } from "../services/config/schema/domain/color.ts";

export const DARK_THEME_COLORS: ColorConfig = {
  primary: "#007bff",
  text: "#ffffff",
} as const;

export const LIGHT_THEME_COLORS: ColorConfig = {
  primary: "#0056b3",
  text: "#111111",
} as const;
