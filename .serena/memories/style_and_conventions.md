# Style & Conventions
- Follow project naming/style conventions (snake_case for `.ts`, PascalCase for shared `.tsx` components).
- `.ts` files: snake_case.
- `.tsx` component files: PascalCase.
- Tests: snake_case + `_test.ts` / `_test.tsx`.
- Feature-first structure with colocated Redux slices under `src/features/*`.
- Keep framework wrappers in `src/lib`; keep side-effect-free helpers in `src/helpers`.
- Avoid formatting comments in reviews.
