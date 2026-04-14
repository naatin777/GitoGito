# Advanced OpenTUI APIs

Advanced and lower-level APIs that sit below the common JSX component surface.

## When to Use This Section

Read these references when you need:
- **3D scenes** via Three.js / WebGPU
- **Low-level drawing** into a framebuffer
- **Zero-copy streaming** with native span feeds
- **Custom syntax styling** or token themes
- **Timeline internals** beyond the basic animation overview

## React vs Core Quick Guide

| Topic | Best entry point | React support in installed packages |
|------|-------------------|-------------------------------------|
| Timeline animations | `animation_timeline.md` | **Direct** via `useTimeline` |
| SyntaxStyle | `syntax_highlighting.md` | **Indirect** - pass core objects into components or helpers |
| Framebuffer | `framebuffer.md` | **Core-first** - no built-in `<framebuffer>` JSX intrinsic in base catalogue |
| NativeSpanFeed | `native_span_feed.md` | **Core-only** |
| 3D / Three.js | `3d.md` | **Core-first** - import from `@opentui/core/3d`, optionally register via `extend()` |

## Reading Order

1. Start with the topic file below.
2. If you are in React, confirm whether the API already has a hook or intrinsic.
3. If not, use core objects directly or register a custom renderable with `extend()`.

## Topic Index

| Topic | File | Notes |
|------|------|-------|
| 3D rendering | `./3d.md` | `ThreeRenderable` / `ThreeCliRenderer` live under `@opentui/core/3d` |
| Framebuffer | `./framebuffer.md` | `OptimizedBuffer` and `FrameBufferRenderable` for custom drawing |
| Native span feed | `./native_span_feed.md` | Zero-copy streaming API with handler lifetime caveats |
| Syntax highlighting | `./syntax_highlighting.md` | `SyntaxStyle`, themes, style IDs, Tree-sitter helpers |
| Timeline details | `./animation_timeline.md` | `Timeline`, `createTimeline`, engine, and React `useTimeline` |

## React Extension Pattern

React's built-in component catalogue only includes the standard intrinsics (`box`, `text`, `input`, `textarea`, `code`, `diff`, etc.). For advanced core renderables, register them explicitly:

```tsx
import { extend } from "@opentui/react"
import { FrameBufferRenderable } from "@opentui/core"

extend({
  framebuffer: FrameBufferRenderable,
})
```

Then use `<framebuffer />` like any other intrinsic in your app.

## See Also

- `../react/REFERENCE.md`
- `../react/api.md`
- `../core/REFERENCE.md`
- `../animation/REFERENCE.md`
