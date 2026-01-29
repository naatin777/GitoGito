import { z } from "zod";
import { DEFAULT_COMMIT_CONFIG, defaultConfig } from "./defaults.ts";
import type { EnvService } from "./env.ts";
import {
  GlobalConfigFile,
  LocalConfigFile,
  ProjectConfigFile,
} from "./file.ts";
import {
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
} from "./schema.ts";

// スキーマとスコープ型の再エクスポート
export {
  CommitConfigSchema,
  ConfigSchema,
  type ConfigScope,
  CredentialsSchema,
  MergedConfigSchema,
};

// 型の再エクスポート
export type { CommitConfig, Config, Credentials, MergedConfig, Suggestion };

export class ConfigService {
  private envService: EnvService;
  private globalConfigFile: GlobalConfigFile;
  private projectConfigFile: ProjectConfigFile;
  private localConfigFile: LocalConfigFile;

  constructor(envService: EnvService);
  constructor(scope: ConfigScope, envService: EnvService);
  constructor(scopeOrEnv: ConfigScope | EnvService, envService?: EnvService) {
    if (typeof scopeOrEnv === "string") {
      // 旧API: new ConfigService(scope, envService)
      this.envService = envService!;
    } else {
      // 新API: new ConfigService(envService)
      this.envService = scopeOrEnv;
    }

    // 設定ファイルインスタンスを作成
    const home = this.envService.getHome();
    this.globalConfigFile = new GlobalConfigFile(home);
    this.projectConfigFile = new ProjectConfigFile();
    this.localConfigFile = new LocalConfigFile();
  }

  /**
   * 後方互換性: フラグからConfigServiceを作成
   * @deprecated 新APIではenvServiceのみを渡すコンストラクタを使用してください
   */
  static createFromFlags(
    flags: { local?: boolean; global?: boolean },
    envService: EnvService,
  ): ConfigService {
    // フラグは無視して、新しいConfigServiceを返す
    return new ConfigService(envService);
  }

  /**
   * ファイルパスを取得
   *
   * @deprecated ConfigFileクラスを直接使用してください
   */
  getConfigPath(type: "global" | "project" | "local"): string {
    const configFile = this.getConfigFile(type);
    return configFile.getPath();
  }

  /**
   * 設定ファイルインスタンスを取得
   */
  private getConfigFile(type: "global" | "project" | "local") {
    switch (type) {
      case "global":
        return this.globalConfigFile;
      case "project":
        return this.projectConfigFile;
      case "local":
        return this.localConfigFile;
    }
  }

  /**
   * 設定を読み込み
   */
  async loadConfig(
    type: "global" | "project" | "local",
  ): Promise<Partial<MergedConfig>> {
    const configFile = this.getConfigFile(type);
    return await configFile.load();
  }

  /**
   * 設定を保存
   */
  async saveConfig(
    config: Partial<MergedConfig>,
    type: "global" | "project" | "local",
  ): Promise<void> {
    const configFile = this.getConfigFile(type);
    await configFile.save(config);
  }

  /**
   * 設定キーを個別に保存
   */
  async saveConfigKey<K extends keyof MergedConfig>(
    key: K,
    value: MergedConfig[K],
    type: "global" | "project" | "local",
  ): Promise<void> {
    await this.saveConfig({ [key]: value } as Partial<MergedConfig>, type);
  }

  /**
   * 後方互換性: 設定を保存
   * @deprecated saveConfig(config, type)を使用してください
   */
  async save(
    config: Partial<MergedConfig>,
    scope: ConfigScope = "local",
  ): Promise<void> {
    await this.saveConfig(config, scope);
  }

  /**
   * 後方互換性: 設定を読み込み
   * @deprecated loadConfig(type)を使用してください
   */
  async load(scope: ConfigScope): Promise<Partial<MergedConfig>> {
    return await this.loadConfig(scope);
  }

  /**
   * 環境変数から設定を読み込み
   */
  private loadFromEnv(): Partial<MergedConfig> {
    const config: Partial<MergedConfig> = {};

    // 環境変数から認証情報を取得（存在する場合のみ）
    try {
      config.ai_api_key = this.envService.getAiApiKey();
    } catch {
      // 環境変数が存在しない場合は無視
    }

    try {
      config.github_token = this.envService.getGitHubToken();
    } catch {
      // 環境変数が存在しない場合は無視
    }

    return config;
  }

  /**
   * 基本設定をマージして取得（認証情報は含まない）
   *
   * 優先順序（低→高）:
   * 1. defaultConfig
   * 2. ~/.config/demmithub/config.yml
   * 3. .demmithub.yml
   * 4. .demmithub.local.yml
   */
  async getMerged(): Promise<Config> {
    // 1. デフォルト設定
    const merged: Partial<Config> = { ...defaultConfig };

    // ヘルパー関数: undefinedでない値のみをマージ
    const mergeConfig = (source: Partial<MergedConfig>) => {
      if (source.language !== undefined) merged.language = source.language;
      if (source.editor !== undefined) merged.editor = source.editor;
      if (source.overview !== undefined) merged.overview = source.overview;
      if (source.provider !== undefined) merged.provider = source.provider;
      if (source.model !== undefined) merged.model = source.model;
    };

    // 2. global config.yml
    const globalConfig = await this.loadConfig("global");
    mergeConfig(globalConfig);

    // 3. project {app}.yml
    const projectConfig = await this.loadConfig("project");
    mergeConfig(projectConfig);

    // 4. local .{app}.yml
    const localConfig = await this.loadConfig("local");
    mergeConfig(localConfig);

    // 最終バリデーション
    try {
      return ConfigSchema.parse(merged);
    } catch (e) {
      if (e instanceof z.ZodError) {
        throw new Error(
          `Invalid configuration:\n${
            e.issues.map((err) => `  ${err.path.join(".")}: ${err.message}`)
              .join("\n")
          }`,
        );
      }
      throw e;
    }
  }

  /**
   * 認証情報を取得
   *
   * 優先順序（低→高）:
   * 1. ~/.config/demmithub/config.yml (global APIキー)
   * 2. .demmithub.local.yml (project APIキー)
   * 3. 環境変数（最優先）
   */
  async getCredentials(): Promise<Credentials> {
    const credentials: Partial<Credentials> = {};

    // 1. global config.yml
    const globalConfig = await this.loadConfig("global");
    if (globalConfig.ai_api_key) {
      credentials.ai_api_key = globalConfig.ai_api_key;
    }
    if (globalConfig.github_token) {
      credentials.github_token = globalConfig.github_token;
    }

    // 2. local .{app}.yml
    const localConfig = await this.loadConfig("local");
    if (localConfig.ai_api_key) {
      credentials.ai_api_key = localConfig.ai_api_key;
    }
    if (localConfig.github_token) {
      credentials.github_token = localConfig.github_token;
    }

    // 3. 環境変数（最優先）
    const envConfig = this.loadFromEnv();
    Object.assign(credentials, envConfig);

    return credentials as Credentials;
  }

  /**
   * 全ての設定と認証情報をマージして取得
   *
   * @deprecated セキュリティのため、getMerged()とgetCredentials()を個別に使用してください
   */
  async getMergedWithCredentials(): Promise<MergedConfig> {
    const config = await this.getMerged();
    const credentials = await this.getCredentials();

    return { ...config, ...credentials };
  }

  /**
   * APIキーを取得（優先順位に従う）
   */
  async getAiApiKey(): Promise<string> {
    const credentials = await this.getCredentials();
    if (!credentials.ai_api_key) {
      throw new Error(
        "AI API key not found in config files or environment variables",
      );
    }
    return credentials.ai_api_key;
  }

  /**
   * GitHub トークンを取得（優先順位に従う）
   */
  async getGitHubToken(): Promise<string> {
    const credentials = await this.getCredentials();
    if (!credentials.github_token) {
      throw new Error(
        "GitHub token not found in config files or environment variables",
      );
    }
    return credentials.github_token;
  }

  /**
   * Commit設定を取得（デフォルト値とマージ）
   */
  async getCommitConfig(): Promise<CommitConfig> {
    // project設定とlocal設定からcommit設定を読み込む
    const projectConfig = await this.loadConfig("project");
    const localConfig = await this.loadConfig("local");

    // local設定が優先
    const commitConfig = localConfig.commit || projectConfig.commit;

    // 設定ファイルのcommit設定とデフォルトをマージ
    if (commitConfig) {
      return {
        rules: {
          ...DEFAULT_COMMIT_CONFIG.rules,
          ...commitConfig.rules,
        },
        type: commitConfig.type && commitConfig.type.length > 0
          ? commitConfig.type
          : DEFAULT_COMMIT_CONFIG.type,
        scope: commitConfig.scope && commitConfig.scope.length > 0
          ? commitConfig.scope
          : DEFAULT_COMMIT_CONFIG.scope,
      };
    }

    return DEFAULT_COMMIT_CONFIG;
  }

  /**
   * コミットタイプのサジェスチョンリストを取得
   */
  async getCommitTypes(): Promise<Suggestion[]> {
    const config = await this.getCommitConfig();
    return config.type;
  }

  /**
   * スコープのサジェスチョンリストを取得
   */
  async getCommitScopes(): Promise<Suggestion[]> {
    const config = await this.getCommitConfig();
    return config.scope;
  }

  /**
   * コミットルールを取得
   */
  async getCommitRules(): Promise<CommitConfig["rules"]> {
    const config = await this.getCommitConfig();
    return config.rules;
  }
}
