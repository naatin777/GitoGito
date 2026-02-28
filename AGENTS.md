## 1. Project Overview

**Gitogito** is an AI-powered CLI tool for generating intelligent commit
messages and GitHub issues.

- **Stack**: Bun, TypeScript, React + OpenTUI, Redux Toolkit, Vercel AI SDK,
  Cliffy.
- **Goal**: Provide an interactive TUI for Git/GitHub workflows using AI
  agents.

## 2. Quick Commands

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
bun run src/main.ts commit                # Generate commit message
bun run src/main.ts issue                 # Generate issue
bun run src/main.ts config                # Open config TUI
```

## 3. Directory Structure

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
  - Each feature has: `xxx_slice.ts` (state), `ui.tsx` (view), `hook.ts`
    (logic), `domain/` (business logic), `components/` (complex UIs)
  - Examples: `commit/`, `issue/`, `config/`
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

## 4. Naming Conventions

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
   - Feature entry files may keep conventional names like `ui.tsx`

3. **Test Files - Use snake_case with `_test.ts` suffix**:
   - Test files follow: `[original_file_name]_test.ts` or
     `[original_file_name]_test.tsx`
   - Examples: `commit_message_test.ts`, `word_wrap_test.ts`
   - Prohibition: Do not use `-test.ts` or `.test.ts` patterns

### Enforcement

- When creating new files, follow these naming conventions
- When reviewing code, suggest renaming for any violations
- Use `git mv` for renaming to preserve file history

## 5. Other

- If a prompt regarding specifications is received, describe it in the `docs`
  folder.
- Do not introduce Deno-specific runtime patterns or comments.
