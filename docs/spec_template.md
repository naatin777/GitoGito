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
  ```typescript
  type State =
    | { step: "init" }
    | { step: "processing"; data: string }
    | { step: "done" };
  ```

## 4. Process Flow

1. User executes command...
2. ...
3. ...

## 5. Constraints

- Must use the existing `AIService`.
- UI must use `Ink` components.
- Follow the directory structure rules in `CLAUDE.md`.
