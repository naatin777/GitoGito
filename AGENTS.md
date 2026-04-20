## How to read this repo

- **`AGENTS.md` (this file)** is the canonical guide: stack, directories, naming, config files, UI rules, and templates.
- **[`.cursor/rules/`](.cursor/rules/)** holds short `.mdc` snippets Cursor injects by scope; they point here for detail. Do not duplicate long specs in rules.
- **Product**: the CLI and npm package are **Gitogito** (`gitogito` in [`package.json`](package.json)).

## Rule ownership model

Use this split to keep guidance maintainable and avoid drift:

- **`AGENTS.md`**: durable project standards and detailed rationale.
- **`.cursor/rules/*.mdc`**: tiny, trigger-scoped reminders that link back to `AGENTS.md`.

When updating guidance:

1. Update `AGENTS.md` first (source of truth).
2. Keep `.mdc` files short (summary + links only).
3. Avoid repeating full rule text in `.mdc`.

## Contents

- [Cursor (IDE)](#cursor-ide)
- [Rule ownership model](#rule-ownership-model)
- [1. Project Overview](#1-project-overview)
- [2. Agent Workflow](#2-agent-workflow)
- [3. Quick Commands](#3-quick-commands)
- [4. Directory Structure](#4-directory-structure)
- [5. Naming Conventions](#5-naming-conventions)
- [6. Configuration File Specification](#6-configuration-file-specification)
- [7. Feature Specification Template](#7-feature-specification-template)
- [8. Known Issues & Technical Debt](#8-known-issues--technical-debt)
- [9. UI Feature Specifications](#9-ui-feature-specifications)
- [10. UI Component Rules](#10-ui-component-rules)
- [11. Other](#11-other)

## Cursor (IDE)

Scoped AI rules for this repo live under [`.cursor/rules/`](.cursor/rules/) (thin summaries; **`AGENTS.md` stays authoritative**). For defaults that apply to every project (models, Chat/Agent features, indexing), use **Cursor Settings** in the app. On macOS, optional user JSON lives at `~/Library/Application Support/Cursor/User/settings.json` — prefer the UI when possible because `cursor.*` keys can change between releases.

## 1. Project Overview

**Gitogito** is an AI-powered CLI tool for generating intelligent commit
messages and GitHub issues.

- **Stack**: Bun, TypeScript, React + OpenTUI, Redux Toolkit, Vercel AI SDK,
  Cliffy.
- **Goal**: Provide an interactive TUI for Git/GitHub workflows using AI
  agents.

---

## 2. Agent Workflow

### Before Implementing

### During Implementation

## 3. Quick Commands

Use these commands to operate the project.

```bash
# Development
bun install                               # Install dependencies
bun run src/main.ts [command]             # Run CLI directly
bun run dev [command]                     # Run via package script
bun test                                  # Run all tests
bun run check                             # Type check

# User-facing Commands (Examples)
bun run src/main.ts init                  # Initialize config
bun run src/main.ts setup                 # Global config wizard
bun run src/main.ts commit                # Generate commit message
bun run src/main.ts issue                 # Generate issue
bun run src/main.ts config                # Open config TUI
```

## 4. Directory Structure

Gitogito follows a layered architecture with clear separation of concerns.

### Core Directories

- **`src/lib/`** - Framework & Infrastructure
  - OpenTUI renderer/runtime (`opentui_render.tsx`, `runner.tsx`), error
    classes, editor engine
  - Rule: No business logic, only framework wrappers/runtime utilities

- **`src/services/`** - External Integrations
  - AI, Git, GitHub API, Config, Editor integration
  - Rule: Encapsulate external dependencies, use repository pattern

- **`src/app/`** - Application Foundation
  - `store.ts` - Redux store configuration
  - `hooks.ts` - Typed Redux hooks (`useAppDispatch`, `useAppSelector`)
  - Rule: Only store setup and app-wide typed hooks, no feature slices

- **`src/features/`** - Feature Slices
  - **Single-page feature** (e.g., `commit/`, `issue/`): `xxx_slice.ts`, `ui.tsx`, `hook.ts`, `routes.tsx`, `domain/`, `components/`
  - **Multi-page feature** (e.g., `init/`, `config/`, `setup/`): additionally requires `layout.tsx` (shared wrapper with progress/header) and one file per page (e.g., `provider_page.tsx`)
  - `routes.tsx` is **required for all features** — it registers the feature's route(s) in the app router
  - `layout.tsx` is **required for multi-page wizard/flow features** — it wraps all child pages with shared UI
  - Rule: Keep related code together, including Redux slices

- **`src/views/`** - Complex UI Flows
  - Multi-component UI features with advanced state management
  - Rule: Use only for exceptionally complex UIs; prefer `features/` for most
    cases

- **`src/helpers/`** - Pure Utilities
  - `text/` - Text processing (word-wrap, line splitting)
  - `collections/` - Data structure helpers
  - `opentui/` - OpenTUI key/input helpers
  - Rule: Pure functions only, no side effects

- **`src/commands/`** - CLI entry points (Cliffy)
- **`src/components/`** - Shared UI components
- **`src/constants/`** - Configuration & constants

### Where to Put New Code

- New feature -> `features/[feature_name]/` with `xxx_slice.ts`, `ui.tsx`,
  `hook.ts`, `domain/`
- Complex UI flow -> `views/[view_name]/` (only for exceptionally complex UIs)
- Redux slice -> colocate in `features/[feature_name]/` or `views/[view_name]/`
- Pure utility function -> `helpers/text/`, `helpers/collections/`, or
  `helpers/opentui/`
- External API integration -> `services/`
- Runtime/framework wrapper -> `lib/`
- Shared component -> `components/` (if used by 2+ features)
- Store configuration -> `app/store.ts` (register feature reducers)

## 5. Naming Conventions

This project uses underscore-based TypeScript file naming conventions.

### File Naming Rules

1. **TypeScript Files (.ts) - Use snake_case**:
   - All TypeScript files must use **snake_case** (lowercase with underscores)
   - Examples: `commit_message.ts`, `auth_middleware.ts`,
     `text_field_reducers.ts`
   - Prohibition: Never use hyphens (`-`) in file names

2. **Component Files (.tsx)**:
   - Shared/reusable component files use **PascalCase**
   - Examples: `UserCard.tsx`, `Select.tsx`, `TextInput.tsx`
   - Feature entry files use snake_case: `ui.tsx`, `layout.tsx`, `hook.ts`, `routes.tsx`
   - Multi-page feature page files use snake_case with `_page` suffix: `provider_page.tsx`, `review_page.tsx`, `done_page.tsx`

3. **Test Files - Use `.test.ts` suffix**:
   - Test files follow: `[original_file_name].test.ts` or
     `[original_file_name].test.tsx`
   - Examples: `commit_message.test.ts`, `word_wrap.test.ts`
   - Prohibition: Do not use `-test.ts` or `_test.ts` patterns

### Enforcement

- When creating new files, follow these naming conventions
- When reviewing code, suggest renaming for any violations
- Use `git mv` for renaming to preserve file history

## 6. Configuration File Specification

Gitogito uses three YAML files with separate responsibilities:

```text
~/.config/gitogito/
└── config.yml              # Global settings + optional global credentials

project/
├── .gitogito.yml           # Shared project settings (git-managed)
└── .gitogito.local.yml     # Personal overrides + optional local credentials
```

### Loading Priority (Low -> High)

1. Hardcoded defaults from `ConfigSchema`
2. `~/.config/gitogito/config.yml`
3. `project/.gitogito.yml`
4. `project/.gitogito.local.yml`
5. Environment variables (see `src/services/config/env.ts` for the full list)

### File Roles

| File | Contents | Git Managed |
| --- | --- | --- |
| `~/.config/gitogito/config.yml` | Global config and optional shared credentials | No |
| `./.gitogito.yml` | Project-level config safe to share with team | Yes |
| `./.gitogito.local.yml` | Personal overrides and optional local credentials | No |

### Security Requirements

Files that may contain credentials must be created with strict permissions:

```text
~/.config/gitogito/              # 700 (drwx------)
~/.config/gitogito/config.yml    # 600 (-rw-------)
project/.gitogito.local.yml      # 600 (-rw-------)
```

---

## 7. Feature Specification Template

When writing a new feature spec, use the following structure:

```markdown
## 1. Overview

- **Objective**:
- **Goal**:

## 2. Files to Modify/Create

- `src/commands/[command].ts`: Command definition
- `src/features/[feature]/`:
  - `ui.tsx`: UI Component
  - `hook.ts`: Business Logic (Custom Hook)

## 3. Data Structures & State Machine (Redux)

- **State Definition**:
  type State =
    | { step: "init" }
    | { step: "processing"; data: string }
    | { step: "done" };

## 4. Process Flow

1. User executes command...
2. ...

## 5. Constraints

- Must use the existing `AIService`.
- Follow the directory structure rules in AGENTS.md.
```

---

## 8. Known Issues & Technical Debt

The following are known issues that should be addressed:

### Priority 1 (Code Health)

1. **Large commented-out code blocks**: `src/features/commit/commit_selectors.ts`, various test files. Decide to restore or delete.
2. **Hook dependency arrays** (`src/components/Spinner.tsx`, `src/features/config/ui.tsx`): Include real dependencies or memoize callbacks.

---

## 9. UI Feature Specifications

### Commit Message UX

The commit editor follows Conventional Commits format with two autocompletion modes:

- **Inline completion** (Copilot-style): Single suggestion in dimmed text after cursor. `Tab` accepts, `Esc` dismisses.
- **List completion** (Dropdown-style): Multiple suggestions below input. `Tab`/`Shift+Tab` navigate, `Enter` accepts.

Context-aware suggestions by phase:
- **Type phase** (before `:`): suggest `fix`, `feat`, `docs`, etc., filtered by current input
- **After type**: suggest `:`, `!:`, `(`
- **Scope phase** (inside `()`): suggest project-defined scopes
- **Description phase** (after `:`): no autocomplete

### Dropdown UI

- Shows up to 5 suggestions at a time with scrolling
- Selected item highlighted with green `→` arrow and inverse colors
- `Tab` (next) / `Shift+Tab` (previous), wraps around
- Scroll keeps selected item near top/middle of visible window

### Commit Message Decorators (Planned)

Decorators add non-editable prefixes/suffixes to commit messages (displayed dimmed):

- **WIP prefix** (`-w` flag): prepends `WIP: `
- **Type emoji**: auto-adds emoji based on commit type (`feat` → `✨`, `fix` → `🐛`, etc.)
- **Breaking change**: prepends `💥 ` when `!` is detected

Implementation uses a **registry pattern**:

```typescript
type CommitDecorator = {
  id: string;
  position: "prefix" | "inline" | "suffix";
  matcher: (context: CommitContext) => boolean;
  generator: (context: CommitContext) => string;
  priority: number;
};
```

Character count includes decorations since they appear in the final commit message.

---

## 10. UI Component Rules

### Themed Components

- **Always check `src/components/ThemedComponents.tsx` first** and use whatever is exported there instead of raw JSX elements (`<box>`, `<text>`, `<scrollbox>`, etc.).
- Import with named imports: `import { Box, Text } from "../../components/ThemedComponents.tsx"`.
- When `ThemedComponents.tsx` gets new exports, use them — do not reach for raw elements.
- Exception: raw elements are allowed only when a specific prop would be overridden by the themed wrapper (e.g., cursor character rendering with `fg` + `TextAttributes.INVERSE`).

### Colors

- **Always obtain colors from `useThemeColors()`** (`src/features/config/use_theme_colors.ts`) and pass them to `fg`/`bg` props.
- Do not hardcode color strings (e.g., `fg="blue"`, `fg="#007bff"`) in UI components. Use `themeColors.primary`, `themeColors.text`, `themeColors.error`, etc.
- Exception: cursor/highlight rendering where a fixed contrast color is intentional.

### Redux Async Thunks

- **Always use `createAppAsyncThunk`** (from `src/app/hooks.ts`) instead of `createAsyncThunk`.
- `createAppAsyncThunk` is pre-typed with `RootState`, `AppDispatch`, and `AppDependencies`, eliminating manual type casts like `extra as AppDependencies`.

---

## 11. Other

- Do not introduce Deno-specific runtime patterns or comments.
- Use Bun/Node-compatible APIs (`node:fs`, `node:path`, `process`) over Deno APIs.
- Use `Bun.stringWidth` for Unicode character width calculation.
- **Use the `yaml` npm package** for all YAML parsing and serialization — not `Bun.YAML`.
  - `parse()` for reading, `parseDocument()` + `doc.setIn()` + `doc.toString()` for comment-preserving writes.
  - `Bun.YAML` does not support document-level AST manipulation and will strip comments.
