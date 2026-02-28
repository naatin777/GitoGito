# src Review Recommendations (Pro Level)

Last updated: 2026-02-12
Scope: `src/` directory

## Summary

This document captures high-priority technical recommendations after reviewing the current `src/` implementation (architecture, runtime behavior, state flow, command layer, and reliability).

Validation status at review time:

- `deno check`: passed
- `deno lint`: passed
- `deno test --allow-all`: passed

Even with passing checks/tests, there are several production-risk issues and maintenance risks that should be addressed.

---

## Priority 1 (Fix Immediately)

### 1) AI provider configuration and runtime implementation are inconsistent

Relevant files:

- `src/services/ai.ts:35`
- `src/services/ai.ts:42`
- `src/services/ai.ts:61`
- `src/services/config/schema/domain/ai.ts:16`

Problem:

- `AIService.create()` currently returns hardcoded dummy values (`"OpenRouter"`, `"model"`, `"aiApiKey"`).
- Default config provider is `ChatGPT`, but runtime `getModel()` throws for `ChatGPT`/`Claude`/`Google Gemini`.
- This means the configuration model and executable behavior diverge.

Recommendation:

- Implement real `AIService.create()` from `ConfigService` and credentials.
- Either:
  - support all configured providers, or
  - constrain schema/provider options to only supported providers for now.
- Add integration tests for `AIService.create()` + provider resolution.

---

### 2) Credential save/load structure mismatch

Relevant files:

- `src/services/config/config_service.ts:55`
- `src/services/config/config_service.ts:74`
- `src/services/config/config_service.ts:125`

Problem:

- Read path expects YAML shape like `{ credentials: { ... } }`.
- `saveCredentials()` writes keys directly to root object, not under `credentials`.
- Saved credentials can become unreadable by current read path and lead to silent config drift.

Recommendation:

- Make `saveCredentials()` write to nested `credentials.<key>`.
- Add round-trip tests: save -> reload -> assert exact value.
- Add migration logic for legacy malformed files if needed.

---

### 3) Config merge is shallow (risk of accidental overwrite)

Relevant file:

- `src/services/config/config_service.ts:85`

Problem:

- `getMergedConfig()` uses spread merge (`...`) only.
- Nested objects (e.g. `commit.rules`) are overwritten as a whole.
- Partial overrides can unintentionally drop sibling nested settings.

Recommendation:

- Replace with deep merge strategy (`lodash.merge` or equivalent deterministic merge).
- Add tests for nested partial merges across global/project/local.

---

## Priority 2 (High Impact Reliability)

### 4) Command implementation and test program are drifting apart

Relevant files:

- `src/commands/config.tsx:55`
- `src/commands/commands_test.ts:46`
- `src/commands/commands_test.ts:50`
- `src/commands/issue.tsx:6`
- `src/commands/init.tsx:8`

Problem:

- Tests define their own command tree (`createProgram`) including `.globalOption(...)`.
- Actual `configCommand` implementation does not mirror that option model.
- `init` and `issue` commands are still console-log placeholders.

Recommendation:

- Share command construction logic between production and tests.
- Replace placeholder actions with actual flows.
- Keep tests black-box against real command exports where possible.

---

### 5) `Select` / `Carousel` are unsafe for empty choices

Relevant files:

- `src/components/Select.tsx:25`
- `src/components/Select.tsx:34`
- `src/components/Carousel.tsx:28`
- `src/components/Carousel.tsx:36`
- `src/components/Carousel.tsx:40`
- `src/features/commit/ui.tsx:23`

Problem:

- `% choices.length` and direct index access are used without zero-length guard.
- Any empty result path can crash UI (AI output edge case, template load edge case, etc.).

Recommendation:

- Add early return for empty choices (`onSelect(undefined)` or dedicated empty-state UI).
- Add component tests for zero-choice behavior.

---

### 6) Error payload handling in async thunks is non-uniform and weakly typed

Relevant files:

- `src/features/issue/issue_slice.ts:45`
- `src/features/issue/issue_slice.ts:63`
- `src/features/issue/issue_slice.ts:78`
- `src/features/issue/issue_slice.ts:23`
- `src/features/issue/ui.tsx:80`

Problem:

- `rejectWithValue(error)` passes unknown/non-serializable objects.
- State only has `{ step: "error" }`; UI renders generic `"Error occurred"`.
- Root cause visibility is low for users and debugging.

Recommendation:

- Standardize on `rejectWithValue(stringMessage)`.
- Extend error state to include `message`.
- Surface actionable error message in UI.

---

## Priority 3 (Code Health / Maintainability)

### 7) Sync file I/O inside async flow

Relevant file:

- `src/features/issue/issue_slice.ts:36`

Problem:

- `Deno.readFileSync(...)` is used inside async thunk.
- Avoidable synchronous I/O in flow logic.

Recommendation:

- Replace with `await Deno.readTextFile(...)`.
- Use `Promise.all` when reading multiple templates.

---

### 8) Hook dependency arrays should include real dependencies

Relevant files:

- `src/components/Spinner.tsx:58`
- `src/features/config/ui.tsx:34`

Problem:

- Effects omit meaningful deps (`handleDataLoading`, `flattenConfigSchema`).
- Current behavior works by assumption; future refactors can introduce stale behavior.

Recommendation:

- Include required dependencies or explicitly memoize callback props.
- If intentional one-shot behavior is required, document and enforce with stable refs.

---

### 9) Large commented-out modules/tests increase maintenance cost

Relevant files:

- `src/features/commit/commit_selectors.ts:6`
- `src/features/commit/commit_selectors_test.ts:73`
- `src/lib/editor_engine/prompt_engine_test.ts:1`
- `src/lib/editor_engine/commit/type_test.ts:1`
- `src/lib/editor_engine/commit/scope_test.ts:1`
- `src/lib/editor_engine/commit/commit_engine_test.ts:1`

Problem:

- Large blocks of dead commented code create noise and confusion.
- Test suite appears healthy while several substantial tests are effectively disabled.

Recommendation:

- Decide per module: restore to active code/tests or delete.
- Track deferred restoration work via explicit issues, not comments.

---

### 10) `if (import.meta.main)` usage is inconsistent with project note

Relevant files:

- `src/components/TextInput.tsx:100`
- `src/components/Spinner.tsx:89`
- `src/components/Select.tsx:79`
- `src/components/AgentLoop.tsx:87`
- `src/components/Carousel.tsx:74`
- `src/services/ai.ts:125`

Problem:

- Project notes request coverage-ignore guard comments around `if (import.meta.main)`.
- Several files use this pattern without standardized guard style.

Recommendation:

- Standardize examples/debug entry blocks in one style.
- Prefer moving demo code to dedicated examples/tests if possible.

---

## Suggested Execution Order

1. Fix `AIService` config/runtime mismatch.
2. Fix credentials save structure.
3. Implement deep merge in config composition.
4. Harden `Select`/`Carousel` empty-state behavior.
5. Normalize thunk error contracts and UI error rendering.
6. Align command tests with real command implementation.
7. Clean dead commented code/test blocks.

