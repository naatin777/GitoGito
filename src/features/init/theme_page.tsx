import { TextAttributes } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import { useState } from "react";
import { useOutletContext } from "react-router";
import { Box, Text } from "../../components/ThemedComponents.tsx";
import { useThemeMode } from "../../contexts/theme_mode_context.tsx";
import { ThemeConfigSchema } from "../../services/config/schema/fields/theme_schema";
import { resolveThemeColors } from "../config/use_theme_colors.ts";
import type { InitOutletContext } from "./layout.tsx";

export function ThemePage() {
  const { config } = useOutletContext<InitOutletContext>();
  const themeMode = useThemeMode();
  const themeColors = resolveThemeColors(
    config.theme.mode,
    themeMode,
    config.theme.color,
  );
  const themes = ThemeConfigSchema.shape.mode.options;
  const [selected, setSelected] = useState(themes.indexOf(config.theme.mode));

  useKeyboard((key) => {
    if (key.name === "down") {
      setSelected((selected + 1) % themes.length);
    } else if (key.name === "up") {
      setSelected((selected - 1 + themes.length) % themes.length);
    }
  });

  return (
    <Box flexDirection="column">
      <Text fg={themeColors.primary} attributes={TextAttributes.BOLD}>Select a theme</Text>
      <Text fg={themeColors.text}>
        current: {config.theme.mode} / detected: {themeMode ?? "unsupported"}
      </Text>
      <Box flexDirection="row">
        <Box flexDirection="column" width={30}>
          {themes.map((theme, index) => (
            <Box key={theme} flexDirection="row" onMouseDown={() => {
              setSelected(index)
            }}>
              <Text fg={themeColors.primary}>{index === selected ? "→ " : "  "}</Text>

              <Text fg={index === selected ? themeColors.primary : themeColors.text}>
                {theme} {theme === config.theme.mode ? "(current)" : ""}
              </Text>

            </Box>
          ))}
        </Box>
        <Box flexDirection="column">
          <Text>Preview</Text>
        </Box>
      </Box>
    </Box>
  );
}
