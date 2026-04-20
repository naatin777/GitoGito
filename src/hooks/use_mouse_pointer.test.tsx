import { testRender } from "@opentui/react/test-utils";
import { expect, test } from "bun:test";
import { act, useEffect } from "react";
import {
  setMousePointerWriterForTest,
  useMousePointer,
} from "./use_mouse_pointer.ts";

const pointerWrites: string[] = [];

function MousePointerProbe({ styles }: { styles: string[] }) {
  const setMousePointer = useMousePointer();

  useEffect(() => {
    setMousePointerWriterForTest((output: string) => {
      pointerWrites.push(output);
    });

    return () => {
      setMousePointerWriterForTest(null);
    };
  }, []);

  useEffect(() => {
    for (const style of styles) {
      setMousePointer(style as Parameters<typeof setMousePointer>[0]);
    }
  }, [setMousePointer, styles]);

  return (
    <box>
      <text>{`pointer:${styles.join(",")}`}</text>
    </box>
  );
}

test("useMousePointer writes OSC 22 sequences only when the style changes", async () => {
  pointerWrites.length = 0;

  const tui = await testRender(
    <MousePointerProbe styles={["ew-resize", "ew-resize", "default"]} />,
    {
      width: 40,
      height: 8,
    },
  );

  await tui.renderOnce();

  expect(tui.captureCharFrame()).toContain("pointer:ew-resize,ew-resize,default");
  expect(pointerWrites).toEqual([
    "\x1b]22;ew-resize\x1b\\",
    "\x1b]22;default\x1b\\",
  ]);

  act(() => {
    tui.renderer.destroy();
  });
});
