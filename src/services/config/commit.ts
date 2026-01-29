import type { ConfigService } from "./config.ts";
import { DEFAULT_COMMIT_CONFIG } from "./defaults.ts";
import type { CommitConfig, Suggestion } from "./schema.ts";

/**
 * CommitConfigProvider - Commit設定のDI用サービス
 *
 * ConfigServiceから設定を読み込み、デフォルト値とマージします。
 * テスト時にはカスタム設定を注入できます。
 */
export class CommitConfigProvider {
  private customConfig?: CommitConfig;
  private configService?: ConfigService;

  /**
   * @param config カスタム設定（テスト用）
   * @param configService ConfigServiceインスタンス（本番用）
   */
  constructor(config?: CommitConfig, configService?: ConfigService) {
    this.customConfig = config;
    this.configService = configService;
  }

  /**
   * 現在の設定を取得
   */
  async getConfig(): Promise<CommitConfig> {
    // カスタム設定が指定されている場合はそれを使用（テスト用）
    if (this.customConfig) {
      return this.customConfig;
    }

    // ConfigServiceから設定を読み込む
    if (this.configService) {
      return await this.configService.getCommitConfig();
    }

    // どちらもない場合はデフォルト設定
    return DEFAULT_COMMIT_CONFIG;
  }

  /**
   * コミットタイプのサジェスチョンリストを取得
   */
  async getTypes(): Promise<Suggestion[]> {
    const config = await this.getConfig();
    return config.type;
  }

  /**
   * スコープのサジェスチョンリストを取得
   */
  async getScopes(): Promise<Suggestion[]> {
    const config = await this.getConfig();
    return config.scope;
  }

  /**
   * ルールを取得
   */
  async getRules(): Promise<CommitConfig["rules"]> {
    const config = await this.getConfig();
    return config.rules;
  }

  /**
   * 設定を更新（テスト用）
   */
  updateConfig(config: CommitConfig): void {
    this.customConfig = config;
  }
}

/**
 * デフォルトのCommitConfigProviderインスタンス
 * 通常のアプリケーション実行時に使用（デフォルト設定のみ）
 */
export const defaultCommitConfigProvider = new CommitConfigProvider();
