import { join } from "@std/path";
import { dirname } from "node:path";
import DenoJson from "../../../deno.json" with { type: "json" };
import { type EnvService, envService } from "./env.ts";

export type ConfigScope = "global" | "project" | "local";

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
      DenoJson.name,
      "config.yml",
    );
  }

  private getProjectPath() {
    return join(
      Deno.cwd(),
      `.${DenoJson.name}.yml`,
    );
  }

  private getLocalPath() {
    return join(
      Deno.cwd(),
      `.${DenoJson.name}.local.yml`,
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

  async load(configScope: ConfigScope): Promise<Partial<string>> {
    const path = this.getFilePath(configScope);
    const content = await Deno.readTextFile(path);
    return content;
  }

  async save(configScope: ConfigScope, data: string): Promise<void> {
    const path = this.getFilePath(configScope);
    const dir = dirname(path);

    if (configScope === "global" || configScope === "local") {
      await Deno.mkdir(dir, { recursive: true, mode: 0o700 });
      await Deno.writeTextFile(path, data, { mode: 0o600 });
    } else {
      await Deno.mkdir(dir, { recursive: true });
      await Deno.writeTextFile(path, data);
    }
  }

  async exists(configScope: ConfigScope): Promise<boolean> {
    const path = this.getFilePath(configScope);
    try {
      const info = await Deno.stat(path);
      return info.isFile;
    } catch (error) {
      if (error instanceof Deno.errors.NotFound) {
        return false;
      }
      throw error;
    }
  }
}

export const configFile = new ConfigFileImpl(envService);
