import { z } from "zod";
import { AI_PROVIDER } from "../../constants/ai.ts";

/**
 * サジェスチョンスキーマ
 * コミットタイプやスコープの選択肢を表す
 */
export const SuggestionSchema = z.object({
  value: z.string(),
  description: z.string(),
  emoji: z.string().optional(),
});

/**
 * コミット設定スキーマ
 * コミットメッセージのルールとサジェスチョンを定義
 */
export const CommitConfigSchema = z.object({
  rules: z.object({
    maxHeaderLength: z.number(),
    requireScope: z.boolean(),
  }),
  type: z.array(SuggestionSchema),
  scope: z.array(SuggestionSchema),
});

/**
 * 基本設定スキーマ
 * アプリケーションの主要な設定項目
 */
export const ConfigSchema = z.object({
  language: z.string(),
  editor: z.string(),
  overview: z.string(),
  provider: z.enum(AI_PROVIDER),
  model: z.string(),
});

/**
 * 認証情報スキーマ
 * APIキーやトークンなどの機密情報
 */
export const CredentialsSchema = z.object({
  ai_api_key: z.string().optional(),
  github_token: z.string().optional(),
});

/**
 * 統合設定スキーマ
 * 基本設定、認証情報、コミット設定を統合
 */
export const MergedConfigSchema = ConfigSchema.extend({
  ...CredentialsSchema.shape,
  commit: CommitConfigSchema.optional(),
});

// 型エクスポート
export type Suggestion = z.infer<typeof SuggestionSchema>;
export type CommitConfig = z.infer<typeof CommitConfigSchema>;
export type Config = z.infer<typeof ConfigSchema>;
export type Credentials = z.infer<typeof CredentialsSchema>;
export type MergedConfig = z.infer<typeof MergedConfigSchema>;

export type ConfigScope = "global" | "project" | "local";
