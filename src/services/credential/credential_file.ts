import { chmod, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import packageJson from "../../../package.json" with { type: "json" };
import { createEnvRepository, type EnvRepository } from "../../repositories/env/env_repository.ts";

export type CredentialsScope = "global" | "local";

export interface CredentialFile {
  load(scope: CredentialsScope): Promise<string>;
  save(scope: CredentialsScope, data: string): Promise<void>;
  exists(scope: CredentialsScope): Promise<boolean>;
}

export class CredentialFileImpl implements CredentialFile {
  constructor(private envRepository: EnvRepository) { }

  private getGlobalPath(): string {
    return join(
      this.envRepository.getHome(),
      ".config",
      packageJson.name,
      "credentials.yml",
    );
  }

  private getLocalPath(): string {
    return join(process.cwd(), `.${packageJson.name}.credentials.yml`);
  }

  private getFilePath(scope: CredentialsScope): string {
    return scope === "global" ? this.getGlobalPath() : this.getLocalPath();
  }

  async load(scope: CredentialsScope): Promise<string> {
    const path = this.getFilePath(scope);
    try {
      return await Bun.file(path).text();
    } catch (error) {
      if (isNotFoundError(error)) return "";
      throw error;
    }
  }

  async save(scope: CredentialsScope, data: string): Promise<void> {
    const path = this.getFilePath(scope);
    const dir = dirname(path);
    await mkdir(dir, { recursive: true, mode: 0o700 });
    await Bun.write(path, data);
    await chmod(path, 0o600);
  }

  async exists(scope: CredentialsScope): Promise<boolean> {
    return Bun.file(this.getFilePath(scope)).exists();
  }
}

export function createCredentialFile(
  envRepository: EnvRepository = createEnvRepository(),
): CredentialFile {
  return new CredentialFileImpl(envRepository);
}

function isNotFoundError(error: unknown): error is NodeJS.ErrnoException {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as NodeJS.ErrnoException).code === "ENOENT"
  );
}
