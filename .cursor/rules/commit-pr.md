# Commit and PR rules

## AI output (e.g. Cursor)

- When auto-generating commit messages or PR text, follow these rules exactly.
- Do not add preambles, greetings, or extra commentary—output only the generated text.
- Infer `type` and `scope` from the change when appropriate.

## Conventional commits

Use [Conventional Commits](https://www.conventionalcommits.org/).

**Format:** `<type>(<scope>): <subject>`

**Rules:**

- `type` (pick one that fits best):
  - `feat` — new feature
  - `fix` — bug fix
  - `refactor` — internal change without new behavior or bug fix
  - `perf` — performance
  - `test` — tests only
  - `docs` — documentation only
  - `chore` — build, tooling, or repo maintenance (not `ci` / `test`)
  - `ci` — CI configuration
- `scope` — optional, only when the impact area is clear (e.g. `tui`, `vscode`, `shared`), lowercase.
- `subject` — **English**, **imperative mood**, about 50 characters, no trailing period.
- For breaking changes, use `!` after `type` or `scope` (e.g. `feat(api)!: change response format`).
- One clear intent per commit.

**Examples:**

- `feat(tui): add interactive commit preview`
- `fix(vscode): handle missing workspace folder`
- `refactor(shared): split branch naming strategy`
- `test(tui): add osc command parser cases`

## Commit granularity

- Split work into **reviewable** chunks.
- Do not mix unrelated edits (e.g. format-only) with feature or bugfix commits.
- If you commit build artifacts, commit them **with** the change that produces them.

## Pull requests

**Title:** same style as [Conventional Commits](#conventional-commits) commit subjects (type, optional scope, short imperative subject). **Do not** append the issue number in the title (e.g. avoid `chore: foo (#123)`). Keep the title about the change only.

**Body (Markdown):** include at least the sections below. **Link the tracking issue in the body**, not the title—e.g. `Related to #123`, `Fixes #123`, or `Closes #123` when the PR should auto-close the issue. One line in **Why** or a short **Related issues** block is enough.

```markdown
## What
## Why
## How to test
## Risks / impact
```

Optional but recommended when an issue exists:

```markdown
## Related issues

- #123 — short reason this PR addresses it
```
