import { join } from "@std/path";
import { parse, stringify } from "@std/yaml";
import { z } from "zod";
import DenoJson from "../../../deno.json" with { type: "json" };
import type { MergedConfig } from "./schema.ts";
import { MergedConfigSchema } from "./schema.ts";

const APP_NAME = DenoJson.name;

/**
 * 設定ファイルの基底クラス
 *
 * 各設定ファイル（global, project, local）の共通機能を提供します。
 */
export abstract class ConfigFile {
  protected abstract getFilePath(): string;
  protected abstract isSecure(): boolean;

  /**
   * ファイルパスを取得（公開API）
   */
  public getPath(): string {
    return this.getFilePath();
  }

  /**
   * パーミッションをチェック
   */
  protected async checkPermissions(path: string): Promise<void> {
    try {
      const stat = await Deno.stat(path);
      if (stat.mode && (stat.mode & 0o077) !== 0) {
        throw new Error(
          `Insecure file permissions for ${path} (current: ${
            (stat.mode & 0o777).toString(8)
          }, expected: 600)\n` +
            `Run: chmod 600 ${path}`,
        );
      }
    } catch (e) {
      // ファイルが存在しない場合は無視
      if (!(e instanceof Deno.errors.NotFound)) {
        throw e;
      }
    }
  }

  /**
   * 設定データをバリデーション
   */
  protected validateConfig(data: unknown): Partial<MergedConfig> {
    try {
      // 部分的なスキーマとしてバリデーション
      const PartialSchema = MergedConfigSchema.partial();
      return PartialSchema.parse(data);
    } catch (e) {
      if (e instanceof z.ZodError) {
        const errors = e.issues.map((issue) =>
          `  ${issue.path.join(".")}: ${issue.message}`
        ).join("\n");

        throw new Error(
          `Configuration validation failed in ${this.getFilePath()}:\n${errors}`,
        );
      }
      throw e;
    }
  }

  /**
   * 設定ファイルを読み込み
   */
  async load(): Promise<Partial<MergedConfig>> {
    const path = this.getFilePath();

    try {
      if (this.isSecure()) {
        await this.checkPermissions(path);
      }

      const content = await Deno.readTextFile(path);
      if (!content || content.trim() === "") {
        return {};
      }

      const parsed = parse(content);
      return this.validateConfig(parsed);
    } catch (e) {
      if (e instanceof Deno.errors.NotFound) {
        return {};
      }
      throw e;
    }
  }

  /**
   * 設定ファイルを保存
   */
  async save(config: Partial<MergedConfig>): Promise<void> {
    const path = this.getFilePath();

    // 既存の設定を読み込んでマージ
    const existing = await this.load();
    const merged = { ...existing, ...config };

    // 保存前にバリデーション
    const validated = this.validateConfig(merged);
    const yaml = stringify(validated as Record<string, unknown>);
    const dir = path.substring(0, path.lastIndexOf("/"));

    if (this.isSecure()) {
      // APIキーを含むファイル用のセキュアな作成
      await Deno.mkdir(dir, { recursive: true, mode: 0o700 });
      await Deno.writeTextFile(path, yaml, { mode: 0o600 });
    } else {
      // 通常の設定ファイル
      await Deno.mkdir(dir, { recursive: true });
      await Deno.writeTextFile(path, yaml);
    }
  }

  /**
   * ファイルが存在するか確認
   */
  async exists(): Promise<boolean> {
    try {
      await Deno.stat(this.getFilePath());
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * グローバル設定ファイル
 *
 * ファイル: ~/.config/demmithub/config.yml
 * 用途: global設定 + global APIキー
 * セキュリティ: 600 (-rw-------)
 */
export class GlobalConfigFile extends ConfigFile {
  constructor(private home: string) {
    super();
  }

  protected getFilePath(): string {
    return join(this.home, ".config", APP_NAME, "config.yml");
  }

  protected isSecure(): boolean {
    return true; // APIキーを含む可能性があるためセキュア
  }
}

/**
 * プロジェクト設定ファイル
 *
 * ファイル: project/.demmithub.yml
 * 用途: 共通設定（git管理対象）
 * セキュリティ: 通常のパーミッション
 */
export class ProjectConfigFile extends ConfigFile {
  protected getFilePath(): string {
    return join(Deno.cwd(), `.${APP_NAME}.yml`);
  }

  protected isSecure(): boolean {
    return false; // git管理対象なのでセキュア設定不要
  }
}

/**
 * ローカル設定ファイル
 *
 * ファイル: project/.demmithub.local.yml
 * 用途: 個人差分 + project APIキー（gitignore対象）
 * セキュリティ: 600 (-rw-------)
 */
export class LocalConfigFile extends ConfigFile {
  protected getFilePath(): string {
    return join(Deno.cwd(), `.${APP_NAME}.local.yml`);
  }

  protected isSecure(): boolean {
    return true; // APIキーを含む可能性があるためセキュア
  }
}
