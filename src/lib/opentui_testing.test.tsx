import { expect, test } from "bun:test";
import { useKeyboard, useRenderer } from "@opentui/react";
import { testRender } from "@opentui/react/test-utils";
import { act, useState } from "react";
import { isEnter } from "../helpers/opentui/key.ts";

function StaticOpenTuiMarkup() {
  return (
    <box>
      <text>Hello OpenTUI</text>
    </box>
  );
}

function RendererAwareOpenTuiMarkup() {
  const renderer = useRenderer();

  return (
    <box>
      <text>{`renderer:${renderer.width}x${renderer.height}`}</text>
    </box>
  );
}

function KeyboardAwareOpenTuiMarkup() {
  const [status, setStatus] = useState("idle");

  useKeyboard((event) => {
    if (event.name === "right") {
      setStatus("right");
      return;
    }

    if (isEnter(event)) {
      setStatus("enter");
    }
  });

  return (
    <box>
      <text>{`status:${status}`}</text>
    </box>
  );
}

test("@opentui/react/test-utils renders static OpenTUI markup", async () => {
  const tui = await testRender(
    <StaticOpenTuiMarkup />,
    {
      width: 40,
      height: 8,
    },
  );

  await tui.renderOnce();

  expect(tui.captureCharFrame()).toContain("Hello OpenTUI");

  act(() => {
    tui.renderer.destroy();
  });
});

test("@opentui/react/test-utils renders hook-based OpenTUI components", async () => {
  const tui = await testRender(
    <RendererAwareOpenTuiMarkup />,
    {
      width: 40,
      height: 8,
    },
  );

  await tui.renderOnce();

  expect(tui.captureCharFrame()).toContain("renderer:40x8");

  act(() => {
    tui.renderer.destroy();
  });
});

test("@opentui/react/test-utils can drive keyboard interaction", async () => {
  const tui = await testRender(
    <KeyboardAwareOpenTuiMarkup />,
    {
      width: 40,
      height: 8,
    },
  );

  await tui.renderOnce();
  expect(tui.captureCharFrame()).toContain("status:idle");

  act(() => {
    tui.mockInput.pressArrow("right");
  });
  await tui.renderOnce();
  expect(tui.captureCharFrame()).toContain("status:right");

  act(() => {
    tui.mockInput.pressEnter();
  });
  await tui.renderOnce();
  expect(tui.captureCharFrame()).toContain("status:enter");

  act(() => {
    tui.renderer.destroy();
  });
});
