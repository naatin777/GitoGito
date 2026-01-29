/**
 * Configuration module
 *
 * このモジュールは設定管理に関する全ての機能を提供します。
 */

// スキーマと型定義
export {
  type CommitConfig,
  CommitConfigSchema,
  type Config,
  ConfigSchema,
  type ConfigScope,
  type Credentials,
  CredentialsSchema,
  type MergedConfig,
  MergedConfigSchema,
  type Suggestion,
  SuggestionSchema,
} from "./schema.ts";

// デフォルト値
export {
  DEFAULT_COMMIT_CONFIG,
  DEFAULT_COMMIT_SCOPES,
  DEFAULT_COMMIT_TYPES,
  defaultConfig,
} from "./defaults.ts";

// 設定ファイルクラス
export {
  ConfigFile,
  GlobalConfigFile,
  LocalConfigFile,
  ProjectConfigFile,
} from "./file.ts";

// 設定サービス
export { ConfigService } from "./config.ts";

// コミット設定プロバイダー
export { CommitConfigProvider, defaultCommitConfigProvider } from "./commit.ts";
