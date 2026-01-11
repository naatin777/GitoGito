## 1. Project Overview

**DemmitHub** is an AI-powered CLI tool for generating intelligent commit
messages and GitHub issues.

- **Stack**: Deno, TypeScript, React + Ink, Redux Toolkit, Vercel AI SDK.
- **Goal**: Provide an interactive TUI for Git/GitHub workflows using AI agents.

## 2. Quick Commands

Use these commands to operate the project.

```bash
# Development
deno run --allow-all src/main.ts [command]  # Run CLI
deno check src/main.ts                      # Type check (Required)
deno test                                   # Run all tests
deno fmt                                    # Format code
deno lint                                   # Lint code

# User-facing Commands (Examples)
demmithub init             # Initialize config
demmithub commit           # Generate commit message
demmithub issue            # Generate issue
demmithub config language  # Set language
```

## 3. Directory Structure

DemmitHub follows a layered architecture with clear separation of concerns.

### Core Directories

- **`src/lib/`** - Framework & Infrastructure
  - CLI framework (`command.ts`), TUI wrapper (`tui.ts`), error classes
  - Rule: No business logic, only framework wrappers

- **`src/services/`** - External Integrations
  - AI, Git, GitHub API, Config, Editor integration
  - Rule: Encapsulate external dependencies, use repository pattern

- **`src/app/`** - Application Foundation (Redux Toolkit 2026)
  - `store.ts` - Redux store configuration
  - `hooks.ts` - Typed Redux hooks (`useAppDispatch`, `useAppSelector`)
  - Rule: Only store setup and hooks, no slices

- **`src/features/`** - Feature Slices (Redux Toolkit 2026 Best Practice)
  - Each feature has: `xxx_slice.ts` (state), `ui.tsx` (view), `hook.ts`
    (logic), `domain/` (business logic), `components/` (complex UIs)
  - Examples: `commit/`, `issue/`, `help/`, `version/`
  - Rule: Keep related code together, **including Redux slices**

- **`src/views/`** - Complex UI Flows
  - Multi-component UI features with advanced state management
  - Example: `edit_commit_message/` - Advanced commit message editor
  - Rule: Use only for exceptionally complex UIs; prefer `features/` for most
    cases

- **`src/helpers/`** - Pure Utilities
  - `text/` - Text processing (word-wrap, line splitting)
  - `collections/` - Data structure helpers
  - Rule: Pure functions only, no side effects, no dependencies

- **`src/commands/`** - CLI Entry Points
- **`src/components/`** - Shared UI Components
- **`src/constants/`** - Configuration & Constants

### Where to Put New Code

- New feature → `features/[feature_name]/` with `xxx_slice.ts`, `ui.tsx`,
  `hook.ts`, `domain/`
- Complex UI flow → `views/[view_name]/` (only for exceptionally complex UIs)
- Redux slice → **Always colocated with the feature/view** in
  `features/[feature_name]/` or `views/[view_name]/`
- Pure utility function → `helpers/text/` or `helpers/collections/`
- External API integration → `services/`
- Framework wrapper → `lib/`
- Shared component → `components/` (if used by 2+ features)
- Store configuration → `app/store.ts` (register feature reducers)

## 4. Naming Conventions

**IMPORTANT**: This project follows the
[Deno Style Guide](https://docs.deno.com/runtime/contributing/style_guide/) for
file naming conventions.

### File Naming Rules

1. **TypeScript Files (.ts) - Use snake_case**:
   - All TypeScript files must use **snake_case** (lowercase with underscores)
   - Examples: `commit_message.ts`, `auth_middleware.ts`,
     `text_field_reducers.ts`
   - **Deno Style Guide Rule**: "Use underscores, not dashes in filenames"
   - **Prohibition**: Never use hyphens (-) in file names

2. **Component Files (.tsx) - Use PascalCase**:
   - React/Ink component files must use **PascalCase** to match component names
   - Examples: `CommitMessage.tsx`, `UserCard.tsx`, `EditCommitMessage.tsx`
   - **Prohibition**: Never use snake_case (e.g., `user_card.tsx`)

3. **Test Files - Use snake_case with `_test.ts` suffix**:
   - Test files follow: `[original_file_name]_test.ts` or
     `[original_file_name]_test.tsx`
   - Examples: `commit_message_test.ts`, `word_wrap_test.ts`
   - **Prohibition**: Do not use `-test.ts` or `.test.ts` patterns

### Examples

| File Type  | ✅ Correct             | ❌ Incorrect                                   |
| ---------- | ---------------------- | ---------------------------------------------- |
| TypeScript | `user_service.ts`      | `user-service.ts`, `userService.ts`            |
| Component  | `UserCard.tsx`         | `user_card.tsx`, `user-card.tsx`               |
| Test       | `user_service_test.ts` | `user-service-test.ts`, `user-service.test.ts` |

### Enforcement

- When creating new files, always follow these naming conventions
- When reviewing code, suggest renaming for any violations
- Use `git mv` for renaming to preserve file history

## 5. Other

If a prompt regarding specifications is received, please describe it in the docs
folder.

When using `if (import.meta.main)`, enclose it with //
deno-coverage-ignore-start

// deno-coverage-ignore-stop
