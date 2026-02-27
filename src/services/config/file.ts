import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import packageJson from "../../../package.json" with { type: "json" };
import { type EnvService, envService } from "./env.ts";

export type CredentialsScope = "global" | "local";
export type ConfigScope = CredentialsScope | "project";

export interface ConfigFile {
  load(configScope: ConfigScope): Promise<string>;
  save(configScope: ConfigScope, data: string): Promise<void>;
  exists(configScope: ConfigScope): Promise<boolean>;
}

export class ConfigFileImpl {
  constructor(
    private envService: EnvService = envService,
  ) {}

  private getGlobalPath() {
    return join(
      this.envService.getHome(),
      ".config",
      packageJson.name,
      "config.yml",
    );
  }

  private getProjectPath() {
    return join(
      process.cwd(),
      `.${packageJson.name}.yml`,
    );
  }

  private getLocalPath() {
    return join(
      process.cwd(),
      `.${packageJson.name}.local.yml`,
    );
  }

  private getFilePath(configScope: ConfigScope): string {
    switch (configScope) {
      case "global":
        return this.getGlobalPath();
      case "local":
        return this.getLocalPath();
      case "project":
        return this.getProjectPath();
    }
  }

  async load(configScope: ConfigScope): Promise<string> {
    const path = this.getFilePath(configScope);
    try {
      const content = await readFile(path, "utf8");
      return content;
    } catch (error) {
      if (isNotFoundError(error)) {
        return "";
      }
      throw error;
    }
  }

  async save(configScope: ConfigScope, data: string): Promise<void> {
    const path = this.getFilePath(configScope);
    const dir = dirname(path);

    if (configScope === "global" || configScope === "local") {
      await mkdir(dir, { recursive: true, mode: 0o700 });
      await writeFile(path, data, { mode: 0o600, encoding: "utf8" });
    } else {
      await mkdir(dir, { recursive: true });
      await writeFile(path, data, "utf8");
    }
  }

  async exists(configScope: ConfigScope): Promise<boolean> {
    const path = this.getFilePath(configScope);
    try {
      const info = await stat(path);
      return info.isFile();
    } catch (error) {
      if (isNotFoundError(error)) {
        return false;
      }
      throw error;
    }
  }
}

export const configFile = new ConfigFileImpl(envService);

function isNotFoundError(error: unknown): error is NodeJS.ErrnoException {
  return typeof error === "object" && error !== null &&
    "code" in error &&
    (error as NodeJS.ErrnoException).code === "ENOENT";
}
