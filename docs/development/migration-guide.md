# Migration Guide: utils/ Directory Reorganization

## Background

The `src/utils/` directory was reorganized to align with our layered
architecture. The original `utils/` had become a catch-all directory containing:

- Framework wrappers
- Service integrations
- Domain-specific business logic
- Pure utility functions

This made it difficult for developers to know where to put new code and violated
the separation of concerns principle.

## Migration Summary

**Date**: 2026-01-08 **Impact**: All files in `src/utils/` moved to appropriate
directories **Breaking Changes**: Import paths changed for all files

## Import Path Changes

| Old Path                            | New Path                                             | Category  | Reason                                      |
| ----------------------------------- | ---------------------------------------------------- | --------- | ------------------------------------------- |
| `utils/tui.ts`                      | `lib/tui.ts`                                         | Framework | TUI wrapper belongs in infrastructure layer |
| `utils/edit.ts`                     | `services/editor.ts`                                 | Service   | External editor integration is a service    |
| `utils/parser.ts`                   | `features/issue/domain/parser.ts`                    | Domain    | Issue-specific template parsing             |
| `utils/path.ts`                     | `features/issue/domain/template-paths.ts`            | Domain    | Issue-specific path resolution              |
| `utils/commit-header-completion.ts` | `features/commit/domain/commit-header-completion.ts` | Domain    | Commit-specific autocomplete logic          |
| `utils/editor/*`                    | `features/commit/domain/parser/*`                    | Domain    | Commit message parsing logic                |
| `utils/word-wrap.ts`                | `helpers/text/word-wrap.ts`                          | Utility   | Pure text processing function               |
| `utils/split-text-to-lines.ts`      | `helpers/text/split-text-to-lines.ts`                | Utility   | Pure text processing function               |
| `utils/cycle_zip.ts`                | `helpers/collections/cycle-zip.ts`                   | Utility   | Pure data structure helper                  |

## Files Affected by Import Changes

### Phase 1: Framework & Service Extraction

**tui.ts → lib/tui.ts** (10 files updated):

- `src/lib/command.ts`
- `src/commands/commit.ts`
- `src/commands/issue.ts`
- `src/commands/root.ts`
- `src/commands/init.ts`
- `src/commands/config/overview.ts`
- `src/commands/config/language.ts`
- `src/commands/config/editor.ts`
- `src/screens/edit-commit-message/components/StatusBar.tsx`
- `src/screens/edit-commit-message/components/Contents.tsx`

**edit.ts → services/editor.ts** (2 files updated):

- `src/store/slices/commitSlice.ts`
- `src/store/slices/issueSlice.ts`

### Phase 2: Domain Logic Migration

**Issue domain** (1 file updated):

- `src/store/slices/issueSlice.ts` - Updated to import from
  `features/issue/domain/`

**Commit domain** (0 files updated):

- Files moved but not currently imported anywhere (future use)

### Phase 3: Pure Utilities

**Text utilities** (2 files updated):

- `src/screens/edit-commit-message/components/Header.tsx`
- `src/screens/edit-commit-message/components/Line.tsx`

**Collections utilities** (1 file updated):

- `src/components/spinner.tsx`

## Migration Process

The migration was completed in 6 phases:

1. **Phase 1**: Move framework and service code (`tui.ts`, `edit.ts`)
2. **Phase 2**: Move domain logic to feature directories
3. **Phase 3**: Move pure utilities to `helpers/`
4. **Phase 4**: Delete empty `utils/` directory
5. **Phase 5**: Update documentation
6. **Phase 6**: Verify with tests and type checking

## Rationale for Each Decision

### Why lib/ for tui.ts?

- **Decision**: Move `tui.ts` from `utils/` to `lib/`
- **Rationale**: It's a framework wrapper (Ink/React/Redux), not a utility
- **Consistency**: `command.ts` and `errors.ts` are already in `lib/`
- **Benefit**: Clear distinction between framework code and utilities

### Why services/editor.ts?

- **Decision**: Move `edit.ts` to `services/` and rename to `editor.ts`
- **Rationale**:
  - It wraps an external tool (text editor)
  - It depends on `ConfigService`, confirming it's not a pure utility
  - Follows the service pattern for external integrations
- **Benefit**: Consistent with other service files

### Why features/*/domain/?

- **Decision**: Move domain-specific logic into feature directories
- **Rationale**:
  - Commit and issue logic is feature-specific, not shared
  - Feature Slice pattern promotes colocation of related code
  - Easier to find and modify feature-specific code
- **Benefit**: Self-contained features, clearer ownership

### Why helpers/?

- **Decision**: Create new `helpers/` directory for pure utilities
- **Rationale**:
  - "helpers" is semantically clearer than "utils"
  - Restricted to pure functions prevents dumping ground
  - Industry standard for this type of code
- **Benefit**: Prevents mixing concerns, clear rules for what belongs

## Lessons Learned

### What Worked Well

1. **Phased approach**: Migrating in small phases with type checking after each
   phase caught errors early
2. **Clear rules**: Having explicit rules for each directory prevented confusion
3. **Feature colocation**: Moving domain logic into features made the codebase
   easier to navigate

### What Could Be Improved

1. **Communication**: Could have documented the migration plan before starting
2. **Automation**: Could have used a script for bulk import path updates

## For Future Migrations

If you need to reorganize code again:

1. **Plan first**: Write the migration plan before making changes
2. **Communicate**: Share the plan with the team
3. **Phase it**: Break the work into small, verifiable phases
4. **Type check**: Run `deno check` after each phase
5. **Test**: Run `deno test` to ensure no breakage
6. **Document**: Update this guide with lessons learned

## See Also

- [Directory Structure Guide](./directory-structure.md) - Where to put new code
- [Architecture Overview](../architecture.md) - System design patterns
