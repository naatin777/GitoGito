import { chmod, mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import type { ConfigFile, ConfigScope } from "@gitogito/core";
import type { ConfigPathResolver } from "./config-paths.js";

export class FsConfigFile implements ConfigFile {
  constructor(private readonly paths: ConfigPathResolver) {}

  pathFor(scope: ConfigScope): string {
    return this.paths.pathFor(scope);
  }

  async load(scope: ConfigScope): Promise<string> {
    const path = this.paths.pathFor(scope);
    try {
      return await Bun.file(path).text();
    } catch (error) {
      if (isNotFoundError(error)) {
        return "";
      }
      throw error;
    }
  }

  async save(scope: ConfigScope, data: string): Promise<void> {
    const path = this.paths.pathFor(scope);
    const dir = dirname(path);
    if (scope === "global" || scope === "local") {
      await mkdir(dir, { recursive: true, mode: 0o700 });
      await Bun.write(path, data);
      await chmod(path, 0o600);
    } else {
      await mkdir(dir, { recursive: true });
      await Bun.write(path, data);
    }
  }

  async exists(scope: ConfigScope): Promise<boolean> {
    const path = this.paths.pathFor(scope);
    return await Bun.file(path).exists();
  }
}

function isNotFoundError(error: unknown): error is NodeJS.ErrnoException {
  return (
    typeof error === "object" && error !== null && "code" in error && (error as NodeJS.ErrnoException).code === "ENOENT"
  );
}
