# Config Module Refactoring Plan

## 目的

設定関連のコードを整理し、以下を実現する：

1. **Zodスキーマを独立したファイルに分離**
2. **デフォルト値を`constants/`から`config/`に移動**
3. **将来の動的スコープ生成に備えた構造**

## 背景

### 現状の問題点

1. **スキーマと実装の混在**
   - `config.ts`（400行超）にスキーマ定義（28行）が混在
   - `src/type.ts`と型定義が重複

2. **デフォルト値の分散**
   - `constants/config.ts` - 基本設定のデフォルト
   - `constants/commit_message/prefix.ts` - コミット設定のデフォルト
   - 設定に関連するコードが2つのディレクトリに分散

3. **スコープの特殊性**
   - `COMMIT_MESSAGE_PREFIX` - ユーザーが設定ファイルで編集可能
   - `COMMIT_MESSAGE_SCOPES` - 将来的にディレクトリ構造から動的生成予定
   - 現在は両方とも定数だが、扱いが異なる

## 提案する構造

```
src/services/config/
├── index.ts           # 公開API
├── schema.ts          # 全てのZodスキーマ + 型定義
├── defaults.ts        # デフォルト値（PREFIX含む）
├── config.ts          # ConfigService
├── file.ts            # ConfigFile
├── commit.ts          # CommitConfigProvider
├── config_test.ts
└── commit_test.ts

src/constants/
├── editor.ts          # UI選択肢（残す）
├── language.ts        # UI選択肢（残す）
├── ai.ts              # UI選択肢（残す）
└── commit_message/
    └── scopes.ts      # スコープ関連（将来の動的生成用に分離）
```

## 詳細設計

### 1. schema.ts（新規作成）

全てのZodスキーマと型定義を集約

### 2. defaults.ts（新規作成）

デフォルト値を集約：

- `defaultConfig` - 基本設定
- `DEFAULT_COMMIT_TYPES` - コミットタイプ（旧COMMIT_MESSAGE_PREFIX）
- `DEFAULT_COMMIT_CONFIG` - コミット設定（scope: []）

### 3. constants/commit_message/scopes.ts（新規作成）

スコープ関連の将来実装用：

- `DEMMITHUB_SCOPES` - DemmitHub用スコープ
- `generateScopesFromDirectory()` - 動的生成関数（スタブ）

## 実装手順

### Phase 1: schema.ts作成

- スキーマ定義を`config.ts`から移動
- `src/type.ts`の重複削除

### Phase 2: defaults.ts作成

- `constants/config.ts`から`defaultConfig`を移動
- `constants/commit_message/prefix.ts`から`COMMIT_MESSAGE_PREFIX`を移動

### Phase 3: scopes.ts作成

- `COMMIT_MESSAGE_SCOPES`を`DEMMITHUB_SCOPES`に改名
- 動的生成関数のスタブを作成

### Phase 4: インポートパス更新

- 全ファイルでインポート元を更新

### Phase 5: 古いファイルの整理

- 不要なファイルを削除

## 重要な設計判断

### なぜPREFIXとSCOPESを分ける？

| 項目             | PREFIX（type）                     | SCOPES（scope）              |
| ---------------- | ---------------------------------- | ---------------------------- |
| **性質**         | 固定的（Conventional Commits標準） | 動的（プロジェクト固有）     |
| **カスタマイズ** | 設定ファイルで上書き可能           | 設定ファイル + 自動生成      |
| **デフォルト**   | `defaults.ts`に定義                | 空配列（プロジェクトで定義） |
| **将来実装**     | 現状維持                           | ディレクトリ構造から自動生成 |

## 検証方法

```bash
# 型チェック
deno check src/services/config/

# テスト
deno test --allow-all src/services/config/
deno test --allow-all

# 動作確認
deno run --allow-all src/main.ts config
deno run --allow-all src/main.ts commit
```

## 期待される効果

- **関心の分離**: スキーマ、デフォルト値、実装ロジックが明確に分離
- **自己完結性**: `config/`モジュールが完全に独立
- **拡張性**: 将来の動的スコープ生成に対応しやすい構造
