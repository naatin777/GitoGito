import { useMemo } from "react";
import { useGetMergedConfigQuery } from "../api/config.ts";
import { DARK_THEME_COLORS, LIGHT_THEME_COLORS } from "../constants/theme.ts";
import {
  type ColorConfig,
  DEFAULT_COLOR_CONFIG,
} from "../services/config/schema/domain/color.ts";
import {
  DEFAULT_THEME_CONFIG,
  type ThemeConfig,
} from "../services/config/schema/domain/theme.ts";

const resolveThemeColor = (
  mode: ThemeConfig["mode"],
  color: Partial<ColorConfig> | undefined,
): ColorConfig => {
  if (mode === "custom") {
    return {
      ...DEFAULT_COLOR_CONFIG,
      ...color,
    };
  }

  return mode === "dark" ? DARK_THEME_COLORS : LIGHT_THEME_COLORS;
};

export const useGetCurrentColor = () => {
  const query = useGetMergedConfigQuery();

  const themeColor = useMemo<ColorConfig>(() => {
    const mode = query.data?.theme?.mode ?? DEFAULT_THEME_CONFIG.mode;
    return resolveThemeColor(mode, query.data?.color);
  }, [query.data]);

  return {
    ...query,
    themeColor,
  };
};
