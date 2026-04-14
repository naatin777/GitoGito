# Framebuffer

Use the framebuffer APIs when normal text/layout components are too high-level and you need to draw cells directly.

## Core Types

- `OptimizedBuffer` from `@opentui/core`
- `FrameBufferRenderable` from `@opentui/core`
- `FrameBuffer` construct from `@opentui/core` renderable constructs

## What `OptimizedBuffer` Gives You

- per-cell writes with `setCell()` / `drawChar()`
- text drawing with `drawText()`
- composition via `drawFrameBuffer()`
- box / grid drawing helpers
- scissor rects and opacity stacks
- direct access to raw backing arrays via `buffers`

## Good Use Cases

- custom charts or sparklines
- pixel-ish effects in terminal cells
- post-processing passes
- custom renderables that do not map cleanly to `text` / `box`

## React Guidance

React does **not** ship a built-in `<framebuffer>` intrinsic in the base catalogue. If you want JSX usage, register `FrameBufferRenderable` yourself:

```tsx
import { extend } from "@opentui/react"
import { FrameBufferRenderable } from "@opentui/core"

extend({
  framebuffer: FrameBufferRenderable,
})
```

Then render `<framebuffer width={...} height={...} />`.

## Important Types

```ts
type FrameBufferOptions = {
  width: number
  height: number
  respectAlpha?: boolean
}
```

```ts
const fb = OptimizedBuffer.create(width, height, "unicode", {
  respectAlpha: true,
  id: "custom-layer",
})
```

## Common Methods

```ts
fb.clear(bg?)
fb.setCell(x, y, char, fg, bg, attributes?)
fb.drawText(text, x, y, fg, bg?, attributes?, selection?)
fb.fillRect(x, y, width, height, bg)
fb.drawFrameBuffer(destX, destY, otherFb, sourceX?, sourceY?, sourceWidth?, sourceHeight?)
fb.drawBox({...})
fb.drawGrid({...})
fb.pushScissorRect(x, y, width, height)
fb.popScissorRect()
fb.pushOpacity(opacity)
fb.popOpacity()
```

## Tradeoff

Framebuffer code is powerful but lower-level than normal OpenTUI composition. Prefer standard renderables unless you need exact cell control.
