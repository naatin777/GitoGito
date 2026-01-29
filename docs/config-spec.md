# Configuration File Specification

## File Structure

```
~/.config/my-app/
└── config.yml            # Global settings + global API keys

project/
├── .my-app.yml           # Shared settings (git-managed)
└── .my-app.local.yml     # Individual overrides + project API keys (gitignored)
```

## Loading Priority (Low → High)

1. `~/.config/my-app/config.yml`
2. `project/.my-app.yml`
3. `project/.my-app.local.yml`
4. Environment variables

Settings are merged with last-win strategy. Environment variables have highest
priority.

## File Roles

| File                  | Contents                         | Git Managed |
| --------------------- | -------------------------------- | ----------- |
| `config.yml`          | Global settings + API keys       | -           |
| `.my-app.yml`         | Shared project settings          | ○           |
| `.my-app.local.yml`   | Individual overrides + API keys  | ✗           |
| Environment variables | For CI/CD and container contexts | -           |

## Security Requirements

### File Permissions

Files containing API keys must have strict permissions set during creation and
writing.

```
~/.config/my-app/              # 700 (drwx------)
~/.config/my-app/config.yml    # 600 (-rw-------)
project/.my-app.local.yml      # 600 (-rw-------)
```

### Deno Implementation

```typescript
// Create directory
await Deno.mkdir(configDir, { recursive: true, mode: 0o700 });

// Write file
await Deno.writeTextFile(configPath, content, { mode: 0o600 });

// Fix permissions on existing file
await Deno.chmod(configPath, 0o600);
```

### Permission Check on Load (Recommended)

Before reading files containing API keys, verify that permissions are
appropriate. Warn if other users have read access.

```typescript
const stat = await Deno.stat(configPath);
if (stat.mode && (stat.mode & 0o077) !== 0) {
  console.warn(`Warning: ${configPath} has insecure permissions`);
}
```

## Design Principles

- Do not use `.env` files. Standardize on YAML
- Environment variables are fallback for environments where config files cannot
  be placed (CI/CD, containers)
- Files containing API keys: 600, directories: 700
- Emit permission warnings on load (AWS-style)
