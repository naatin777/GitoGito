import type { ThemeMode } from "@opentui/core";
import { useMemo } from "react";
import { useAppSelector } from "../../app/hooks.ts";
import type { RootState } from "../../app/store.ts";
import { useThemeMode } from "../../contexts/theme_mode_context.tsx";
import type { ColorConfig, ThemeConfig } from "../../services/config/schema/fields/theme_schema.ts";
import { DARK_THEME_COLORS, DEFAULT_COLOR_CONFIG, LIGHT_THEME_COLORS, SOLID_DARK_THEME_COLORS, SOLID_LIGHT_THEME_COLORS } from "../../services/config/schema/fields/theme_schema.ts";

export function resolveThemeColors(
  mode: ThemeConfig["mode"],
  themeMode: ThemeMode | null,
  customColors: ColorConfig = DEFAULT_COLOR_CONFIG,
): ColorConfig {
  switch (mode) {
    case "AdaptiveDark":
      return themeMode === "light"
        ? LIGHT_THEME_COLORS
        : DARK_THEME_COLORS;
    case "AdaptiveLight":
      return themeMode === "dark"
        ? DARK_THEME_COLORS
        : LIGHT_THEME_COLORS;
    case "GenericDark":
      return DARK_THEME_COLORS;
    case "GenericLight":
      return LIGHT_THEME_COLORS;
    case "SolidDark":
      return SOLID_DARK_THEME_COLORS;
    case "SolidLight":
      return SOLID_LIGHT_THEME_COLORS;
    case "Custom":
      return customColors;
  }
}

export function useThemeColors(): ColorConfig {
  const config = useAppSelector(((state: RootState) => state.config.mergedConfig));
  const themeMode = useThemeMode();

  if (!config) {
    throw new Error("Merged config must be preloaded before using useThemeColors.");
  }

  return useMemo(
    () => resolveThemeColors(config.theme.mode, themeMode, config.theme.color),
    [config.theme.color, config.theme.mode, themeMode],
  );
}
