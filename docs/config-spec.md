# Configuration File Specification

## File Structure

Gitogito uses three YAML files with separate responsibilities:

```text
~/.config/gitogito/
└── config.yml              # Global settings + optional global credentials

project/
├── .gitogito.yml           # Shared project settings (git-managed)
└── .gitogito.local.yml     # Personal overrides + optional local credentials
```

## Loading Priority (Low -> High)

Configuration is merged with a last-win strategy:

1. Hardcoded defaults from `ConfigSchema`
2. `~/.config/gitogito/config.yml`
3. `project/.gitogito.yml`
4. `project/.gitogito.local.yml`
5. Environment variables for credentials

Only credentials are read from the environment today:

- `GITOGITO_AI_API_KEY`
- `GITOGITO_GITHUB_TOKEN`

## File Roles

| File | Contents | Git Managed |
| --- | --- | --- |
| `~/.config/gitogito/config.yml` | Global config and optional shared credentials for the current machine | No |
| `./.gitogito.yml` | Project-level config safe to share with the team | Yes |
| `./.gitogito.local.yml` | Personal project overrides and optional machine-local credentials | No |
| Environment variables | Highest-priority credential overrides for CI or ephemeral environments | No |

## Data Model

- `global` and `local` files may contain both config values and a `credentials`
  object.
- `project` config is limited to shareable configuration values and does not
  store credentials.
- Merged config is built in `src/services/config/config_service.ts`.

## Security Requirements

Files that may contain credentials should be created with strict permissions:

```text
~/.config/gitogito/              # 700 (drwx------)
~/.config/gitogito/config.yml    # 600 (-rw-------)
project/.gitogito.local.yml      # 600 (-rw-------)
```

## Bun/Node Implementation

Gitogito uses Bun with Node-compatible filesystem APIs:

```typescript
import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

await mkdir(dirname(path), { recursive: true, mode: 0o700 });
await writeFile(path, data, { encoding: "utf8", mode: 0o600 });
```

For project-scoped config, the file remains git-friendly and is written without
credential-specific permission hardening.

## Current Behavior Notes

- Missing config files are treated as empty config.
- Global and local files are parsed as `AppContext` so credentials can be split
  from normal config.
- Project config is parsed as plain `Config`.
- The current implementation sets secure permissions when writing global/local
  files, but does not yet warn on insecure existing permissions while loading.
