# 設定ファイル構成仕様

## ファイル構成

```
~/.config/my-app/
└── config.yml            # global設定 + global APIキー

project/
├── .my-app.yml           # 共通設定（git管理）
└── .my-app.local.yml     # 個人差分 + project APIキー（gitignore）
```

## 読み込み優先順位（低→高）

1. `~/.config/my-app/config.yml`
2. `project/.my-app.yml`
3. `project/.my-app.local.yml`
4. 環境変数

後勝ちでマージする。環境変数が最優先。

## 各ファイルの役割

| ファイル | 中身 | git管理 |
|----------|------|---------|
| `config.yml` | global設定 + APIキー | - |
| `.my-app.yml` | project共通設定 | ○ |
| `.my-app.local.yml` | 個人差分 + project APIキー | ✗ |
| 環境変数 | CI/CD・コンテナ用 | - |

## セキュリティ要件

### ファイルパーミッション

APIキーを含むファイルは作成・書き込み時に厳格なパーミッションを設定する。

```
~/.config/my-app/              # 700 (drwx------)
~/.config/my-app/config.yml    # 600 (-rw-------)
project/.my-app.local.yml      # 600 (-rw-------)
```

### Deno実装

```typescript
// ディレクトリ作成
await Deno.mkdir(configDir, { recursive: true, mode: 0o700 });

// ファイル書き込み
await Deno.writeTextFile(configPath, content, { mode: 0o600 });

// 既存ファイルのパーミッション修正
await Deno.chmod(configPath, 0o600);
```

### 読み込み時のパーミッションチェック（推奨）

APIキーを含むファイルの読み込み前に、パーミッションが適切か確認する。
他ユーザーに読み取り権限がある場合は警告を出す。

```typescript
const stat = await Deno.stat(configPath);
if (stat.mode && (stat.mode & 0o077) !== 0) {
  console.warn(`Warning: ${configPath} has insecure permissions`);
}
```

## 設計方針

- `.env`は使わない。YAMLで統一
- 環境変数は設定ファイルを置けない環境（CI/CD、コンテナ）のフォールバック
- APIキーを含むファイルは600、ディレクトリは700
- 読み込み時にパーミッション警告を出す（AWSスタイル）
