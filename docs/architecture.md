# Architecture Overview

## 1. System Design

DemmitHub follows a **Layered Architecture** adapted for a Terminal UI (TUI)
application.

### Layers

1. **Presentation Layer (`src/features/*/ui.tsx`)**
   - Built with **React** and **Ink**.
   - Responsible only for rendering and capturing user input.
   - **Rule**: No complex logic here. Delegate to Hooks.

2. **Application Layer (`src/features/*/hook.ts`, `src/app/`,
   `src/features/*/*_slice.ts`, `src/views/*/*_slice.ts`)**
   - Connects UI to the underlying services.
   - Manages application state using **Redux Toolkit**.
   - Handles "User Flows" (e.g., Commit Flow, Issue Creation Flow).
   - State management follows Feature-based structure (slices colocated with
     features or views).

3. **Domain/Service Layer (`src/services/`, `src/features/*/domain/`)**
   - Core business logic, independent of the UI.
   - **GitService**: Wraps `simple-git` with the Repository pattern.
   - **AIService**: Wraps Vercel AI SDK, enforcing Zod schemas for structured
     output.
   - **ConfigService**: Manages the 3-tier configuration (Global/Project/Local).
   - **EditorService**: External text editor integration.
   - **Feature domains**: Feature-specific business logic (e.g.,
     `features/commit/domain/`, `features/issue/domain/`).

4. **Infrastructure Layer (`src/lib/`, `src/helpers/`)**
   - **lib/**: Framework wrappers (`tui.ts`, `command.ts`, `errors.ts`).
   - **helpers/**: Pure utility functions organized by category:
     - `text/`: Text processing utilities (word-wrap, split-text-to-lines).
     - `collections/`: Data structure helpers (cycle-zip).

---

## 2. Key Design Patterns

### The "Feature Slice" Pattern (2026 Redux Toolkit Best Practice)

Every major feature (e.g., `commit`, `issue`) is isolated within its feature
folder:

1. **State**: `src/features/[feature]/[feature]_slice.ts` (Redux state machine)
2. **Logic**: `src/features/[feature]/hook.ts` (Custom hook)
3. **View**: `src/features/[feature]/ui.tsx` (Component)
4. **Domain**: `src/features/[feature]/domain/` (Business logic)

This follows the **Feature-based Folder Structure** recommended by Redux Toolkit
2026, where all related code (state, logic, UI) is colocated within the feature
directory.

**Note on src/views/**: For exceptionally complex UI flows (like
`edit_commit_message/`), components may reside in `src/views/` instead of
`src/features/`. However, the same Feature Slice pattern applies - state, logic,
and domain code should still be colocated with the view.

### The Command Pattern

All CLI commands inherit from `BaseCommand` (`src/lib/command.ts`).

- Encapsulates argument parsing, flag validation, and help text generation.
- Commands are hierarchical (Root -> Config -> Language).

### AI Integration Pattern

AI is treated as a deterministic function using **Structured Outputs**.

- We do not use free-form text generation.
- All AI interactions must pass through `AIService.generateStructuredOutput`
  with a strict **Zod Schema**.

---

## 3. Data Flow (State Machine)

Complex features like "Commit Generation" are modeled as explicit State Machines
in Redux.

**Example: Commit Flow**

1. `loading`: Fetching Git diff.
2. `select`: User selecting a candidate message.
3. `edit`: User editing the message in $EDITOR.
4. `commit`: Executing git commit.
5. `done` / `error`: Final states.

**Rule**: The Redux state must always have a `step` property to indicate the
current state.

---

## 4. Configuration Precedence

Configuration is merged in the following order (Last one wins):

1. **Default** (Hardcoded)
2. **Global** (`~/.config/demmithub/.config.yml`)
3. **Project** (`./.demmithub.yml`)
4. **Local** (`./.demmithub.local.yml`)

---

## 5. Development Guidelines

- **Type Safety**: Strictly define return types for all public methods.
- **Testing**: Colocate tests with implementation (`*_test.ts`). Use
  `@std/testing`.
- **Deno**: Use JSR imports where possible. Avoid `npm:` unless necessary.
