import { chmod, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import packageJson from "../../../package.json" with { type: "json" };
import { createEnvRepository, type EnvRepository } from "../../repositories/env/env_repository.ts";

export type ConfigScope = "global" | "project" | "local";

export interface ConfigFile {
  load(configScope: ConfigScope): Promise<string>;
  save(configScope: ConfigScope, data: string): Promise<void>;
  exists(configScope: ConfigScope): Promise<boolean>;
}

export class ConfigFileImpl implements ConfigFile {
  constructor(
    private envRepository: EnvRepository,
  ) { }

  private getGlobalPath() {
    return join(
      this.envRepository.getHome(),
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
      const content = await Bun.file(path).text();
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
      await Bun.write(path, data);
      await chmod(path, 0o600);
    } else {
      await mkdir(dir, { recursive: true });
      await Bun.write(path, data);
    }
  }

  async exists(configScope: ConfigScope): Promise<boolean> {
    const path = this.getFilePath(configScope);
    return Bun.file(path).exists();
  }
}

export function createConfigFile(
  envRepository: EnvRepository = createEnvRepository(),
): ConfigFile {
  return new ConfigFileImpl(envRepository);
}

function isNotFoundError(error: unknown): error is NodeJS.ErrnoException {
  return typeof error === "object" && error !== null &&
    "code" in error &&
    (error as NodeJS.ErrnoException).code === "ENOENT";
}
