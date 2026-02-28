# Bun + OpenTUI Migration Spec

## Goal

Migrate Gitogito runtime from `Deno + Ink` to `Bun + OpenTUI` while keeping
existing CLI command structure and feature behavior.

## Scope

- Runtime: Deno entry execution to Bun execution
- TUI: Ink renderer/hooks/components to OpenTUI
- CLI parser: Cliffy command tree (Bun runtime compatible)
- Deno APIs: Replace with Bun/Node-compatible APIs
- YAML/front matter/unicode-width utilities: Replace Deno std modules with npm
  packages

## Non-goals

- Full UX redesign
- Full test framework rewrite across all historical/commented tests

## Implementation Notes

- Removed temporary compatibility layer (`src/lib/tui.tsx`)
- UI now uses native OpenTUI primitives and hooks:
  - JSX intrinsic elements: `<box>`, `<text>`
  - Hooks: `useKeyboard`, `useRenderer`, `useTerminalDimensions`
  - Runtime renderer helper: `src/lib/opentui_render.tsx`
- CLI root uses `@cliffy/command` in `src/main.ts`
- Command modules use `@cliffy/command` in `src/commands/*.tsx`
- Config/issue/file/runtime code replaced Deno APIs with:
  - `process.env`, `process.cwd`, `process.on/off`
  - `node:fs` / `node:fs/promises`
  - `node:path`
- Replaced std libs:
  - `@std/yaml` -> `Bun.YAML`
  - `@std/front-matter/yaml` -> local parser + `Bun.YAML`
  - `@std/cli` unicode width -> `Bun.stringWidth`

## Build/Test Tooling

- Added `package.json` for Bun
- Added `tsconfig.json` for strict TypeScript checking under Bun
- Removed `deno.json` and `deno.lock`
- Added Bun scripts:
  - `bun run src/main.ts`
  - `bun test`
  - `bunx tsc --noEmit`
