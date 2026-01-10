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

- `command.ts` - BaseCommand class for CLI framework
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
│   ├── commitSlice.ts        # Redux state management
│   ├── ui.tsx                # Main UI component
│   ├── hook.ts               # Custom hook
│   ├── commitSelectors.ts    # Memoized selectors
│   └── domain/               # Business logic
│       ├── commit-header-completion.ts
│       └── parser/
│           ├── get-commit-state.ts
│           └── ...
├── issue/
│   ├── issueSlice.ts         # Redux state management
│   ├── ui.tsx
│   ├── hook.ts
│   └── domain/
│       ├── parser.ts
│       └── template-paths.ts
├── edit-commit-message/      # Complex feature with multiple components
│   ├── editCommitMessageSlice.ts
│   ├── headerSlice.ts
│   ├── bodySlice.ts
│   ├── footerSlice.ts
│   ├── formSlice.ts
│   ├── types.ts
│   └── components/           # Feature-specific components
│       ├── EditCommitMessage.tsx
│       ├── Header.tsx
│       ├── Body.tsx
│       └── ...
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
  - `word-wrap.ts` - Word-boundary text wrapping
  - `split-text-to-lines.ts` - Line splitting with metadata
- `collections/` - Data structure helpers
  - `cycle-zip.ts` - Array cycling and zipping

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
import { commitReducer } from "../features/commit/commitSlice.ts";
import { issueReducer } from "../features/issue/issueSlice.ts";
import { editCommitMessageReducer } from "../features/edit-commit-message/editCommitMessageSlice.ts";

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

**Purpose**: Command definitions extending BaseCommand.

**Contains**: Individual command files that parse arguments and delegate to
features.

**Rules**:

- ✅ Thin layer for CLI interface
- ✅ Argument parsing and validation
- ❌ Business logic (delegate to features)
- ❌ UI rendering (delegate to features)

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

### ~~src/screens/~~ (Deprecated - Moved to features/)

**Previous Purpose**: Multi-component screen flows.

**Migration**: All screen components have been moved to their respective feature
folders under `features/*/components/`.

**Example**:

- Old: `src/screens/edit-commit-message/`
- New: `src/features/edit-commit-message/components/`

**Reason for change**: Following Redux Toolkit 2026 best practices, complex UIs
are now colocated with their feature's state management and business logic for
better maintainability.

### src/constants/ - Configuration & Constants

**Purpose**: Immutable configuration and constant values.

**Contains**:

- `message.ts` - AI prompts
- `shortcuts.ts` - Keyboard shortcuts
- `commit-message/` - Commit message constants

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
├─ Yes → src/features/[feature-name]/
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

1. Create `src/features/[feature-name]/`
2. Add `[feature-name]Slice.ts` for Redux state management **← In the feature
   folder**
3. Add `ui.tsx` for the UI component
4. Add `hook.ts` for business logic (connects slice to UI)
5. If needed, add `domain/` for feature-specific helpers
6. If complex, add `components/` for multiple UI components
7. Create command in `src/commands/[feature-name].ts`
8. Register reducer in `src/app/store.ts`:
   ```typescript
   import { featureReducer } from "../features/[feature-name]/[feature-name]Slice.ts";

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

1. Create service file in `src/services/[service-name].ts`
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
See `migration-guide.md` for details on the reorganization.

## See Also

- [Architecture Overview](../architecture.md) - System design and patterns
- [Migration Guide](./migration-guide.md) - Import path changes
