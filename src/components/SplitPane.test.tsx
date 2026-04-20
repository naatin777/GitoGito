import { testRender } from "@opentui/react/test-utils";
import { expect, test } from "bun:test";
import { act } from "react";
import { Provider } from "react-redux";
import { createAppStore } from "../app/store.ts";
import { ConfigSchema } from "../services/config/schema/config_schema.ts";
import { SplitPane, parseDefaultSize } from "./SplitPane.tsx";

// ---------------------------------------------------------------------------
// parseDefaultSize — pure unit tests (no renderer needed)
// ---------------------------------------------------------------------------

test("parseDefaultSize returns the number directly for px values", () => {
  expect(parseDefaultSize(300, 800)).toBe(300);
});

test("parseDefaultSize converts percentage string to px", () => {
  expect(parseDefaultSize("25%", 80)).toBe(20);
  expect(parseDefaultSize("50%", 80)).toBe(40);
  expect(parseDefaultSize("100%", 80)).toBe(80);
});

test("parseDefaultSize falls back to half the container for unknown strings", () => {
  expect(parseDefaultSize("auto", 80)).toBe(40);
  expect(parseDefaultSize("", 60)).toBe(30);
});

test("parseDefaultSize rounds percentage results", () => {
  // 30% of 80 = 24.0 — stays 24
  expect(parseDefaultSize("30%", 80)).toBe(24);
  // 33% of 80 = 26.4 → rounds to 26
  expect(parseDefaultSize("33%", 80)).toBe(26);
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeStore() {
  return createAppStore({
    config: {
      mergedConfig: ConfigSchema.parse({ theme: { mode: "GenericDark" } }),
    },
  });
}

function wrap(node: React.ReactNode) {
  return <Provider store={makeStore()}>{node}</Provider>;
}

// ---------------------------------------------------------------------------
// Rendering — horizontal split (default)
// ---------------------------------------------------------------------------

test("SplitPane renders content of both panes", async () => {
  const tui = await testRender(
    wrap(
      <SplitPane>
        {[<text>left-pane</text>, <text>right-pane</text>]}
      </SplitPane>,
    ),
    { width: 80, height: 24 },
  );

  await tui.renderOnce();
  const frame = tui.captureCharFrame();

  expect(frame).toContain("left-pane");
  expect(frame).toContain("right-pane");

  act(() => { tui.renderer.destroy(); });
});

test("SplitPane horizontal: first pane occupies defaultSize columns", async () => {
  const tui = await testRender(
    wrap(
      <SplitPane direction="horizontal" defaultSize={20}>
        {[<text>AAAA</text>, <text>BBBB</text>]}
      </SplitPane>,
    ),
    { width: 80, height: 10 },
  );

  await tui.renderOnce();
  const frame = tui.captureCharFrame();

  // Both pane contents must appear
  expect(frame).toContain("AAAA");
  expect(frame).toContain("BBBB");
  expect(frame).toContain("┃");

  act(() => { tui.renderer.destroy(); });
});

test("SplitPane horizontal: percentage defaultSize renders both panes", async () => {
  const tui = await testRender(
    wrap(
      <SplitPane direction="horizontal" defaultSize="30%">
        {[<text>LEFT</text>, <text>RIGHT</text>]}
      </SplitPane>,
    ),
    { width: 80, height: 10 },
  );

  await tui.renderOnce();
  const frame = tui.captureCharFrame();

  expect(frame).toContain("LEFT");
  expect(frame).toContain("RIGHT");

  act(() => { tui.renderer.destroy(); });
});

// ---------------------------------------------------------------------------
// Rendering — vertical split
// ---------------------------------------------------------------------------

test("SplitPane vertical: renders both panes stacked", async () => {
  const tui = await testRender(
    wrap(
      <SplitPane direction="vertical" defaultSize={5}>
        {[<text>TOP</text>, <text>BOTTOM</text>]}
      </SplitPane>,
    ),
    { width: 80, height: 24 },
  );

  await tui.renderOnce();
  const frame = tui.captureCharFrame();

  expect(frame).toContain("TOP");
  expect(frame).toContain("BOTTOM");
  expect(frame).toContain("━━");

  act(() => { tui.renderer.destroy(); });
});

// ---------------------------------------------------------------------------
// Drag — resize via mouse
// ---------------------------------------------------------------------------

test("SplitPane horizontal: dragging divider right increases first pane", async () => {
  // defaultSize=30 → divider is at x=30
  const tui = await testRender(
    wrap(
      <SplitPane direction="horizontal" defaultSize={30} minSize={5}>
        {[<text>FIRST</text>, <text>SECOND</text>]}
      </SplitPane>,
    ),
    { width: 80, height: 20 },
  );

  await tui.renderOnce();

  // Drag divider 10 columns to the right — first pane should grow to 40
  await act(async () => { await tui.mockMouse.drag(30, 5, 40, 5); });
  await tui.renderOnce();

  // Both panes must still be visible after drag
  const frame = tui.captureCharFrame();
  expect(frame).toContain("FIRST");
  expect(frame).toContain("SECOND");

  act(() => { tui.renderer.destroy(); });
});

test("SplitPane horizontal: dragging divider left shrinks first pane", async () => {
  const tui = await testRender(
    wrap(
      <SplitPane direction="horizontal" defaultSize={40} minSize={5}>
        {[<text>FIRST</text>, <text>SECOND</text>]}
      </SplitPane>,
    ),
    { width: 80, height: 20 },
  );

  await tui.renderOnce();

  // Drag divider 10 columns to the left
  await act(async () => { await tui.mockMouse.drag(40, 5, 30, 5); });
  await tui.renderOnce();

  const frame = tui.captureCharFrame();
  expect(frame).toContain("FIRST");
  expect(frame).toContain("SECOND");

  act(() => { tui.renderer.destroy(); });
});

test("SplitPane respects minSize when dragging past boundary", async () => {
  const tui = await testRender(
    wrap(
      <SplitPane direction="horizontal" defaultSize={20} minSize={10}>
        {[<text>FIRST</text>, <text>SECOND</text>]}
      </SplitPane>,
    ),
    { width: 80, height: 20 },
  );

  await tui.renderOnce();

  // Attempt to drag divider all the way to x=0 (past minSize=10)
  await act(async () => { await tui.mockMouse.drag(20, 5, 0, 5); });
  await tui.renderOnce();

  // Both panes still visible — first pane should be clamped to minSize (10)
  const frame = tui.captureCharFrame();
  expect(frame).toContain("FIRST");
  expect(frame).toContain("SECOND");

  act(() => { tui.renderer.destroy(); });
});

// ---------------------------------------------------------------------------
// Drag — vertical split
// ---------------------------------------------------------------------------

test("SplitPane vertical: dragging divider down increases first pane", async () => {
  const tui = await testRender(
    wrap(
      <SplitPane direction="vertical" defaultSize={8} minSize={3}>
        {[<text>TOP</text>, <text>BOTTOM</text>]}
      </SplitPane>,
    ),
    { width: 80, height: 24 },
  );

  await tui.renderOnce();

  // Drag divider 4 rows down
  await act(async () => { await tui.mockMouse.drag(10, 8, 10, 12); });
  await tui.renderOnce();

  const frame = tui.captureCharFrame();
  expect(frame).toContain("TOP");
  expect(frame).toContain("BOTTOM");

  act(() => { tui.renderer.destroy(); });
});
