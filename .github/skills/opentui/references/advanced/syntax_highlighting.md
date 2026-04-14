# Syntax Highlighting

OpenTUI's syntax styling surface is centered on **`SyntaxStyle`** plus helpers that transform themes and Tree-sitter results into styled text.

## Core Pieces

- `SyntaxStyle.create()`
- `SyntaxStyle.fromTheme(theme)`
- `SyntaxStyle.fromStyles(styles)`
- `convertThemeToStyles(theme)`
- Tree-sitter helpers such as `treeSitterToStyledText(...)`

## React Guidance

React does not add a separate syntax-highlighting abstraction here. You usually create `SyntaxStyle` from core and then pass it into core-backed components such as code / markdown / textarea-related helpers.

## Main APIs

```ts
const style = SyntaxStyle.fromTheme([
  {
    scope: ["keyword", "keyword.control"],
    style: { foreground: "#ff0000", bold: true },
  },
])
```

```ts
const style = SyntaxStyle.fromStyles({
  keyword: { fg: RGBA.fromHex("#ff0000"), bold: true },
  string: { fg: RGBA.fromHex("#00ff00"), italic: true },
})
```

## Useful Methods

```ts
style.registerStyle(name, def)
style.resolveStyleId(name)
style.getStyleId(name)
style.getStyle(name)
style.mergeStyles(...names)
style.getAllStyles()
style.getRegisteredNames()
style.getStyleCount()
style.clearCache()
style.clearNameCache()
```

## Where It Connects

- `code` / `diff` / `markdown` style pipelines
- custom text rendering
- input `extmarks` when you want token-like color regions
- Tree-sitter based highlighting helpers in core

## Important Detail

`getStyleId("keyword.control")` can fall back to base scopes like `"keyword"` when available, so dotted scope naming is useful even if you only register coarser styles.
