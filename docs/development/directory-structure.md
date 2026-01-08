# Directory Structure Guide

## Overview

This document explains the organization of DemmitHub's source code and provides
guidelines for where to place new code.

## Architecture Alignment

DemmitHub follows a 4-layer architecture:

1. **Infrastructure Layer** → `src/lib/`, `src/helpers/`
2. **Service/Domain Layer** → `src/services/`, `src/features/*/domain/`
3. **Application Layer** → `src/features/*/hook.ts`, `src/store/`
4. **Presentation Layer** → `src/features/*/ui.tsx`, `src/components/`,
   `src/screens/`

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

### src/features/ - Feature Slices

**Purpose**: Self-contained feature modules following the Feature Slice pattern.

**Structure**: Each feature directory contains:

- `ui.tsx` - React/Ink component (Presentation layer)
- `hook.ts` - Custom hook with business logic (Application layer)
- `domain/` - Feature-specific business logic and helpers

**Examples**:

```
features/
├── commit/
│   ├── ui.tsx
│   ├── hook.ts
│   └── domain/
│       ├── commit-header-completion.ts
│       └── parser/
│           ├── get_commit_state.ts
│           └── ...
├── issue/
│   ├── ui.tsx
│   ├── hook.ts
│   └── domain/
│       ├── parser.ts
│       └── template-paths.ts
```

**Rules**:

- ✅ Feature-specific UI, logic, and domain code
- ✅ Self-contained and cohesive
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

### src/store/ - State Management

**Purpose**: Redux Toolkit slices for global state management.

**Contains**:

- `slices/` - Redux slices (e.g., commitSlice, issueSlice,
  editCommitMessageSlice)
- `hooks.ts` - Typed Redux hooks
- `index.ts` - Store configuration

**Rules**:

- ✅ State machines for complex flows
- ✅ Global application state
- ❌ Business logic (delegate to services/hooks)
- ❌ Side effects (use thunks sparingly)

**When to use**: Managing state that needs to be shared across components or
persists through user interactions.

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

### src/screens/ - Complex Screen Components

**Purpose**: Multi-component screen flows that don't fit the feature slice
pattern.

**Contains**: Complex UIs like `edit-commit-message/`.

**Rules**:

- ✅ Complex multi-component screens
- ✅ Self-contained screen logic
- ❌ Simple single-component UIs (use features/ or components/)

**When to use**: Creating a complex, multi-step UI flow.

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
            ├─ Is it global state?
            │  └─ Yes → src/store/
            └─ No
               ├─ Is it a shared UI component?
               │  └─ Yes → src/components/
               └─ No
                  └─ Is it configuration?
                     └─ Yes → src/constants/
```

## Common Patterns

### Adding a New Feature

1. Create `src/features/[feature-name]/`
2. Add `ui.tsx` for the UI component
3. Add `hook.ts` for business logic
4. If needed, add `domain/` for feature-specific helpers
5. Create command in `src/commands/[feature-name].ts`
6. Add Redux slice in `src/store/slices/[feature]Slice.ts`

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
