# Architecture Overview

## 1. System Design

DemmitHub follows a **Layered Architecture** adapted for a Terminal UI (TUI)
application.

### Layers

1. **Presentation Layer (`src/features/*/ui.tsx`)**
   - Built with **React** and **Ink**.
   - Responsible only for rendering and capturing user input.
   - **Rule**: No complex logic here. Delegate to Hooks.

2. **Application Layer (`src/features/*/hook.ts`, `src/store/`)**
   - Connects UI to the underlying services.
   - Manages application state using **Redux Toolkit**.
   - Handles "User Flows" (e.g., Commit Flow, Issue Creation Flow).

3. **Domain/Service Layer (`src/services/`)**
   - Core business logic, independent of the UI.
   - **GitService**: Wraps `simple-git` with the Repository pattern.
   - **AIService**: Wraps Vercel AI SDK, enforcing Zod schemas for structured
     output.
   - **ConfigService**: Manages the 3-tier configuration (Global/Project/Local).

4. **Infrastructure Layer (`src/lib/`, `src/utils/`)**
   - Low-level utilities, command parsing (`BaseCommand`), and error handling.

---

## 2. Key Design Patterns

### The "Feature Slice" Pattern

Every major feature (e.g., `commit`, `issue`) is isolated across three files:

1. **State**: `src/store/slices/[feature]Slice.ts` (Redux state machine)
2. **Logic**: `src/features/[feature]/hook.ts` (Custom hook)
3. **View**: `src/features/[feature]/ui.tsx` (Component)

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
