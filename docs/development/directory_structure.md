# Directory Structure Guide

## Overview

This document explains the organization of DemmitHub's source code and provides
guidelines for where to place new code.

## Architecture Alignment

DemmitHub follows a 4-layer architecture:

1. **Infrastructure Layer** → `src/lib/`, `src/helpers/`
2. **Service/Domain Layer** → `src/services/`, `src/features/*/domain/`
3. **Application Layer** → `src/features/*/hook.ts`,
   `src/features/*/xxxSlice.ts`, `src/app/`
4. **Presentation Layer** → `src/features/*/ui.tsx`,
   `src/features/*/components/`, `src/components/`

## Directory Reference

### src/lib/ - Framework & Infrastructure

**Purpose**: Framework wrappers and foundational abstractions.

**Contains**:

- `tui.ts` - Ink/React/Redux wrapper for TUI
- `errors.ts` - Custom error classes

**Rules**:

- ✅ Framework wrappers (Ink, Deno APIs)
- ✅ Foundational abstractions used across the app
- ❌ Business logic
- ❌ Feature-specific code
- ❌ External API integrations (those go in services/)

**When to use**: Creating a wrapper around a framework or library that will be
used throughout the application.

### src/services/ - External Integrations

**Purpose**: Service layer for external dependencies and integrations.

**Contains**:

- `ai.ts` - Vercel AI SDK wrapper
- `config.ts` - Configuration management
- `env.ts` - Environment variable access
- `editor.ts` - External text editor integration
- `git/` - Git operations (repository pattern)
- `github/` - GitHub API integration

**Rules**:

- ✅ Wrappers for external APIs
- ✅ Third-party library integrations
- ✅ Repository pattern for data access
- ❌ UI code
- ❌ Business logic (that goes in features/*/domain/)
- ❌ Pure utilities (those go in helpers/)

**When to use**: Integrating with an external API, database, or third-party
service.

### src/features/ - Feature Slices (Redux Toolkit 2026 Best Practice)

**Purpose**: Self-contained feature modules following the Feature-based Folder
Structure.

**Structure**: Each feature directory contains:

- `ui.tsx` - React/Ink component (Presentation layer)
- `hook.ts` - Custom hook with business logic (Application layer)
- `xxxSlice.ts` - Redux Toolkit slice (State management) **← Colocated with
  feature**
- `domain/` - Feature-specific business logic and helpers
- `components/` - Feature-specific UI components (for complex features)

**Examples**:

```
features/
├── commit/
│   ├── commit_slice.ts       # Redux state management
│   ├── ui.tsx                # Main UI component
│   ├── hook.ts               # Custom hook
│   ├── commit_selectors.ts   # Memoized selectors
│   └── domain/               # Business logic
│       ├── commit_header_completion.ts
│       └── parser/
│           ├── get_commit_state.ts
│           └── ...
├── issue/
│   ├── issue_slice.ts        # Redux state management
│   ├── ui.tsx
│   ├── hook.ts
│   └── domain/
│       ├── parser.ts
│       └── template_paths.ts
```

**Rules**:

- ✅ Feature-specific UI, logic, state, and domain code **all in one place**
- ✅ Self-contained and cohesive
- ✅ Redux slices colocated with the feature they manage
- ❌ Importing from other features (use services/ or helpers/ for shared code)
- ❌ Generic utilities (those go in helpers/)

**When to use**: Adding a new feature or command to DemmitHub.

### src/helpers/ - Pure Utilities

**Purpose**: Pure, reusable utility functions with no side effects.

**Contains**:

- `text/` - Text processing utilities
  - `word_wrap.ts` - Word-boundary text wrapping
  - `split_text_to_lines.ts` - Line splitting with metadata
- `collections/` - Data structure helpers
  - `cycle_zip.ts` - Array cycling and zipping

**Rules**:

- ✅ Pure functions (no side effects)
- ✅ No external dependencies beyond standard library
- ✅ Reusable across multiple features
- ❌ Feature-specific logic
- ❌ State management
- ❌ External API calls

**When to use**: Creating a generic utility function that could be used by
multiple features.

### src/app/ - Application Foundation (Redux Toolkit 2026)

**Purpose**: Global application configuration and typed hooks.

**Contains**:

- `store.ts` - Redux store configuration (combines all feature reducers)
- `hooks.ts` - Typed Redux hooks (`useAppDispatch`, `useAppSelector`)

**Rules**:

- ✅ Only store configuration and typed hooks
- ✅ Import feature reducers from `src/features/*/xxxSlice.ts`
- ❌ No business logic
- ❌ No feature-specific code
- ❌ No slice definitions (those go in features/)

**Example store.ts**:

```typescript
import { configureStore } from "@reduxjs/toolkit";
import { commitReducer } from "../features/commit/commit_slice.ts";
import { issueReducer } from "../features/issue/issue_slice.ts";
import { editCommitMessageReducer } from "../views/edit_commit_message/edit_commit_message_slice.ts";

export const store = configureStore({
  reducer: {
    commit: commitReducer,
    issue: issueReducer,
    editCommitMessage: editCommitMessageReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

**When to use**:

- Configuring the Redux store
- Adding a new feature reducer to the store
- Never for slice definitions (use features/ instead)

### src/commands/ - CLI Entry Points

**Purpose**: Command definitions using Cliffy's Command API.

**Contains**: Individual command files that export Cliffy Command instances
configured with descriptions, options, and action handlers.

**Structure**: Each command exports a `Command` instance:

```typescript
import { Command } from "@cliffy/command";
import React from "react";
import { FeatureUI } from "../features/feature/ui.tsx";
import { runTui } from "../lib/tui.ts";

export const featureCommand = new Command()
  .description("Feature description")
  .option("--flag", "Flag description")
  .action(async () => {
    const ui = React.createElement(FeatureUI, null);
    await runTui(ui);
  });
```

**Rules**:

- ✅ Use Cliffy's declarative Command API
- ✅ Thin layer for CLI interface
- ✅ Delegate to feature UI components via runTui()
- ❌ Business logic (delegate to features)
- ❌ Direct UI rendering (use runTui)

**When to use**: Adding a new CLI command.

### src/components/ - Shared UI Components

**Purpose**: Reusable Ink components used by multiple features.

**Contains**: Generic UI components like `spinner.tsx`, `selection.tsx`.

**Rules**:

- ✅ Used by 2+ features
- ✅ Generic and configurable
- ❌ Feature-specific components (those go in features/)
- ❌ Business logic

**When to use**: Extracting a UI component that is used by multiple features.

### src/views/ - Complex UI Flows

**Purpose**: Houses complex, multi-component UI flows that don't fit the simple
feature pattern.

**Current contents**:

- `edit_commit_message/` - Advanced commit message editor with Redux state
  management
  - Contains: `edit_commit_message_slice.ts`, `header_slice.ts`,
    `body_slice.ts`, `footer_slice.ts`, `form_slice.ts`, `types.ts`
  - Components: `components/EditCommitMessage.tsx`, `Header.tsx`, `Body.tsx`,
    `Hooter.tsx`, etc.

**Relationship to features/**:

- `views/` contains UI-heavy features with complex component hierarchies
- `features/` contains simpler, more straightforward features
- Both use the same Redux slice pattern (colocated with feature)

**Rules**:

- ✅ Use for exceptionally complex UI flows with multiple sub-components
- ✅ Follow same patterns as features/ (slices colocated with view)
- ❌ Don't use for simple features - prefer features/ directory
- ❌ Don't mix concerns - keep state, logic, and UI together

**When to use**: Only for features with complex UI hierarchies that require
multiple specialized components. Most features should go in `features/`.

### ~~src/screens/~~ (Deprecated - Moved to views/)

**Migration**: The `screens/` directory has been renamed to `views/` to better
reflect its purpose.

**Example**:

- Old: `src/screens/edit_commit_message/`
- New: `src/views/edit_commit_message/`

### src/constants/ - Configuration & Constants

**Purpose**: Immutable configuration and constant values.

**Contains**:

- `message.ts` - AI prompts
- `shortcuts.ts` - Keyboard shortcuts
- `commit_message/` - Commit message constants

**Rules**:

- ✅ Immutable configuration
- ✅ Const exports only
- ❌ Mutable state
- ❌ Functions

**When to use**: Defining constants that are used across the application.

## Decision Tree

Use this flowchart to decide where new code belongs:

```
Is it a new feature or command?
├─ Yes → src/features/[feature_name]/
│        (includes slice, ui, hook, domain, components)
└─ No
   ├─ Is it a pure utility function?
   │  └─ Yes → src/helpers/text/ or src/helpers/collections/
   └─ No
      ├─ Is it wrapping an external API?
      │  └─ Yes → src/services/
      └─ No
         ├─ Is it a framework wrapper?
         │  └─ Yes → src/lib/
         └─ No
            ├─ Is it Redux store configuration?
            │  └─ Yes → src/app/
            └─ No
               ├─ Is it a shared UI component?
               │  └─ Yes → src/components/
               └─ No
                  └─ Is it configuration?
                     └─ Yes → src/constants/
```

## Common Patterns

### Adding a New Feature (Redux Toolkit 2026)

1. Create `src/features/[feature_name]/`
2. Add `[feature_name]_slice.ts` for Redux state management **← In the feature
   folder**
3. Add `ui.tsx` for the UI component
4. Add `hook.ts` for business logic (connects slice to UI)
5. If needed, add `domain/` for feature-specific helpers
6. If complex, add `components/` for multiple UI components
7. Create command in `src/commands/[feature_name].ts`
8. Register reducer in `src/app/store.ts`:
   ```typescript
   import { featureReducer } from "../features/[feature_name]/[feature_name]_slice.ts";

   export const store = configureStore({
     reducer: {
       // ... other reducers
       [featureName]: featureReducer,
     },
   });
   ```

### Creating a Helper Function

1. Determine if it's text processing or data structure manipulation
2. Create in `src/helpers/text/` or `src/helpers/collections/`
3. Write unit tests alongside (e.g., `word-wrap_test.ts`)
4. Ensure it's a pure function with no side effects

### Integrating with External API

1. Create service file in `src/services/[service_name].ts`
2. Use repository pattern if dealing with data access
3. Export functions or classes that encapsulate the integration
4. Handle errors and provide typed interfaces

## Anti-Patterns

### ❌ Don't Do This:

- **Putting business logic in components**: Components should only render UI
- **Putting UI code in services**: Services should be UI-agnostic
- **Creating a "misc" or "common" directory**: Use the structured directories
- **Importing from features/X/ to features/Y/**: Extract shared code to helpers/
  or services/
- **Mixing concerns**: Each file should have a single, clear responsibility

### ✅ Do This Instead:

- Extract shared logic to `helpers/`
- Use dependency injection for cross-feature needs
- Create proper service abstractions
- Follow the single responsibility principle
- Keep related code colocated (feature slices)

## Migration History

The current structure was established after reorganizing the original
`src/utils/` directory, which had become a catch-all for various types of code.

### Background

The original `src/utils/` directory mixed together:

- Framework wrappers
- Service integrations
- Domain-specific business logic
- Pure utility functions

This made it difficult for developers to know where to put new code and violated
the separation of concerns principle.

### Key Import Path Changes

When the reorganization was completed (2026-01-08), the following files were
moved:

| Old Path                            | New Path                                             | Category  | Reason                                      |
| ----------------------------------- | ---------------------------------------------------- | --------- | ------------------------------------------- |
| `utils/tui.ts`                      | `lib/tui.ts`                                         | Framework | TUI wrapper belongs in infrastructure layer |
| `utils/edit.ts`                     | `services/editor.ts`                                 | Service   | External editor integration is a service    |
| `utils/parser.ts`                   | `features/issue/domain/parser.ts`                    | Domain    | Issue-specific template parsing             |
| `utils/path.ts`                     | `features/issue/domain/template_paths.ts`            | Domain    | Issue-specific path resolution              |
| `utils/commit_header_completion.ts` | `features/commit/domain/commit_header_completion.ts` | Domain    | Commit-specific autocomplete logic          |
| `utils/word_wrap.ts`                | `helpers/text/word_wrap.ts`                          | Utility   | Pure text processing function               |
| `utils/split_text_to_lines.ts`      | `helpers/text/split_text_to_lines.ts`                | Utility   | Pure text processing function               |
| `utils/cycle_zip.ts`                | `helpers/collections/cycle_zip.ts`                   | Utility   | Pure data structure helper                  |

### Decision Rationale

**Why lib/ for framework wrappers?**

- `tui.ts` is a framework wrapper (Ink/React/Redux), not a utility
- `errors.ts` contains custom error classes for the application
- Clear distinction between framework code and utilities

**Why services/ for external integrations?**

- `editor.ts` wraps an external tool (text editor)
- It depends on `ConfigService`, confirming it's not a pure utility
- Follows the service pattern for external integrations

**Why features/*/domain/ for feature-specific logic?**

- Commit and issue logic is feature-specific, not shared
- Feature Slice pattern promotes colocation of related code
- Easier to find and modify feature-specific code

**Why helpers/ for pure utilities?**

- "helpers" is semantically clearer than "utils"
- Restricted to pure functions prevents it from becoming a dumping ground
- Industry standard for this type of code

### Guidelines for Future Migrations

If you need to reorganize code again:

1. **Plan first**: Write the migration plan before making changes
2. **Communicate**: Share the plan with stakeholders
3. **Phase it**: Break the work into small, verifiable phases
4. **Type check**: Run `deno check` after each phase
5. **Test**: Run `deno test` to ensure no breakage
6. **Document**: Update documentation with lessons learned

## See Also

- [Architecture Overview](../architecture.md) - System design and patterns
