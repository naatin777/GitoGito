# Style & Conventions
- Follow Deno style guide.
- `.ts` files: snake_case.
- `.tsx` component files: PascalCase.
- Tests: snake_case + `_test.ts` / `_test.tsx`.
- Feature-first structure with colocated Redux slices under `src/features/*`.
- Keep framework wrappers in `src/lib`; keep side-effect-free helpers in `src/helpers`.
- Avoid formatting comments in reviews (`deno fmt` expected).