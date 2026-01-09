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

- **`src/features/`** - Feature Slices
  - Each feature has: `ui.tsx` (view), `hook.ts` (logic), `domain/` (business
    logic)
  - Examples: `commit/`, `issue/`, `help/`, `version/`
  - Rule: Keep related code together, feature should be self-contained

- **`src/helpers/`** - Pure Utilities
  - `text/` - Text processing (word-wrap, line splitting)
  - `collections/` - Data structure helpers
  - Rule: Pure functions only, no side effects, no dependencies

- **`src/store/`** - State Management (Redux Toolkit)
- **`src/commands/`** - CLI Entry Points
- **`src/components/`** - Shared UI Components
- **`src/screens/`** - Complex Screen Components
- **`src/constants/`** - Configuration & Constants

### Where to Put New Code

- New feature → `features/[feature-name]/` with `ui.tsx`, `hook.ts`, `domain/`
- Pure utility function → `helpers/text/` or `helpers/collections/`
- External API integration → `services/`
- Framework wrapper → `lib/`
- Shared component → `components/` (if used by 2+ features)

## 4. Naming Conventions

**IMPORTANT**: Maintain consistent file naming across the codebase.

### File Naming Rules

1. **TypeScript Files (.ts) - Use kebab-case**:
   - All TypeScript files must use **kebab-case** (lowercase with hyphens)
   - Examples: `commit-message.ts`, `auth-middleware.ts`,
     `text-field-reducers.ts`
   - **Prohibition**: Never mix underscores (_) with hyphens

2. **Component Files (.tsx) - Use PascalCase**:
   - React/Ink component files must use **PascalCase** to match component names
   - Examples: `CommitMessage.tsx`, `UserCard.tsx`, `EditCommitMessage.tsx`
   - **Prohibition**: Never use snake_case (e.g., `user_card.tsx`)

3. **Test Files - Use kebab-case with `-test.ts` suffix**:
   - Test files follow: `[original-file-name]-test.ts` or
     `[original-file-name]-test.tsx`
   - Examples: `commit-message-test.ts`, `word-wrap-test.ts`
   - **Prohibition**: Do not use `_test.ts` or `.test.ts` patterns

### Examples

| File Type  | ✅ Correct             | ❌ Incorrect                                   |
| ---------- | ---------------------- | ---------------------------------------------- |
| TypeScript | `user-service.ts`      | `user_service.ts`, `userService.ts`            |
| Component  | `UserCard.tsx`         | `user_card.tsx`, `user-card.tsx`               |
| Test       | `user-service-test.ts` | `user_service_test.ts`, `user-service.test.ts` |

### Enforcement

- When creating new files, always follow these naming conventions
- When reviewing code, suggest renaming for any violations
- Use `git mv` for renaming to preserve file history

## 5. Other

If a prompt regarding specifications is received, please describe it in the docs
folder.
