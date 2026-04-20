import { expect, test } from "bun:test";
import { testRender } from "@opentui/react/test-utils";
import { act } from "react";
import { ThemeModeProvider, useThemeMode } from "../contexts/theme_mode_context.tsx";

function ThemeModeProbe() {
  const themeMode = useThemeMode();

  return (
    <box>
      <text>{`theme:${themeMode ?? "null"}`}</text>
    </box>
  );
}

test("useThemeMode reads the renderer theme mode", async () => {
  const tui = await testRender(
    <ThemeModeProvider>
      <ThemeModeProbe />
    </ThemeModeProvider>,
    {
      width: 40,
      height: 8,
    },
  );

  await tui.renderOnce();

  expect(tui.captureCharFrame()).toContain("theme:null");

  act(() => {
    tui.renderer.emit("theme_mode", "dark");
  });
  await tui.renderOnce();

  expect(tui.captureCharFrame()).toContain("theme:dark");

  act(() => {
    tui.renderer.emit("theme_mode", "light");
  });
  await tui.renderOnce();

  expect(tui.captureCharFrame()).toContain("theme:light");

  act(() => {
    tui.renderer.destroy();
  });
});
