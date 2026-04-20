import { testRender } from "@opentui/react/test-utils";
import { expect, test } from "bun:test";
import { act } from "react";
import { Provider } from "react-redux";
import { createAppStore } from "../../app/store.ts";
import { ConfigSchema } from "../../services/config/schema/config_schema.ts";
import { DARK_THEME_COLORS, DEFAULT_COLOR_CONFIG, LIGHT_THEME_COLORS, SOLID_LIGHT_THEME_COLORS } from "../../services/config/schema/fields/theme_schema.ts";
import { resolveThemeColors, useThemeColors } from "./use_theme_colors.ts";

test("resolveThemeColors reflects detected light mode for AdaptiveDark", () => {
  expect(resolveThemeColors("AdaptiveDark", "light")).toEqual(LIGHT_THEME_COLORS);
});

test("resolveThemeColors reflects detected dark mode for AdaptiveLight", () => {
  expect(resolveThemeColors("AdaptiveLight", "dark")).toEqual(DARK_THEME_COLORS);
});

test("resolveThemeColors keeps backgroundColor undefined for GenericLight", () => {
  expect(resolveThemeColors("GenericLight", null)).toEqual(LIGHT_THEME_COLORS);
});

test("resolveThemeColors returns backgroundColor for SolidLight", () => {
  expect(resolveThemeColors("SolidLight", null)).toEqual(SOLID_LIGHT_THEME_COLORS);
});

test("resolveThemeColors preserves custom colors including undefined background", () => {
  expect(
    resolveThemeColors("Custom", "dark", DEFAULT_COLOR_CONFIG),
  ).toEqual(DEFAULT_COLOR_CONFIG);
});

test("resolveThemeColors falls back to default custom colors", () => {
  expect(resolveThemeColors("Custom", null)).toEqual(DEFAULT_COLOR_CONFIG);
});

function ThemeColorsProbe() {
  const colors = useThemeColors();

  return (
    <box>
      <text>
        {`colors:${colors.primary}`}
      </text>
    </box>
  );
}

test("useThemeColors reads colors from preloaded config", async () => {
  const store = createAppStore({
    config: {
      mergedConfig: ConfigSchema.parse({
        theme: { mode: "SolidLight" },
      }),
    }
  });
  const tui = await testRender(
    <Provider store={store}>
      <ThemeColorsProbe />
    </Provider>,
    {
      width: 80,
      height: 8,
    },
  );

  await tui.renderOnce();

  expect(tui.captureCharFrame()).toContain("colors:#0056b3");

  act(() => {
    tui.renderer.destroy();
  });
});
