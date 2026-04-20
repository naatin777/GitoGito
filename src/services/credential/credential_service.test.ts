import { expect, test } from "bun:test";
import type { EnvRepository } from "../../repositories/env/env_repository.ts";
import type { CredentialFile, CredentialsScope } from "./credential_file.ts";
import { CredentialServiceImpl } from "./credential_service.ts";

class CredentialFileMock implements CredentialFile {
  private files = new Map<CredentialsScope, string>();

  constructor(seed?: Partial<Record<CredentialsScope, string>>) {
    if (seed?.global) this.files.set("global", seed.global);
    if (seed?.local) this.files.set("local", seed.local);
  }

  async load(scope: CredentialsScope): Promise<string> {
    return this.files.get(scope) ?? "";
  }

  async save(scope: CredentialsScope, data: string): Promise<void> {
    this.files.set(scope, data);
  }

  async exists(scope: CredentialsScope): Promise<boolean> {
    return this.files.has(scope);
  }
}

const envMock: EnvRepository = {
  getCredentials: () => ({}),
  getHome: () => "/tmp",
  getNoColor: () => false,
};

const envMockWithCredentials: EnvRepository = {
  getCredentials: () => ({ openRouterApiKey: "env-openrouter-key", githubToken: "env-github-token" }),
  getHome: () => "/tmp",
  getNoColor: () => false,
};

// --- getGlobalCredentials ---

test("getGlobalCredentials - returns parsed credentials from file", async () => {
  const file = new CredentialFileMock({ global: "openRouterApiKey: sk-key\n" });
  const service = new CredentialServiceImpl(envMock, file);

  const creds = await service.getGlobalCredentials();

  expect(creds).toEqual({ openRouterApiKey: "sk-key" });
});

test("getGlobalCredentials - returns empty object for empty file", async () => {
  const service = new CredentialServiceImpl(envMock, new CredentialFileMock());
  expect(await service.getGlobalCredentials()).toEqual({});
});

// --- getLocalCredentials ---

test("getLocalCredentials - returns parsed credentials from file", async () => {
  const file = new CredentialFileMock({ local: "githubToken: local-token\n" });
  const service = new CredentialServiceImpl(envMock, file);

  expect((await service.getLocalCredentials()).githubToken).toBe("local-token");
});

// --- getMergedCredentials ---

test("getMergedCredentials - merges global and local", async () => {
  const file = new CredentialFileMock({
    global: "openRouterApiKey: global-key\n",
    local: "githubToken: local-token\n",
  });
  const service = new CredentialServiceImpl(envMock, file);

  const merged = await service.getMergedCredentials();

  expect(merged.openRouterApiKey).toBe("global-key");
  expect(merged.githubToken).toBe("local-token");
});

test("getMergedCredentials - local overrides global", async () => {
  const file = new CredentialFileMock({
    global: "openRouterApiKey: global-key\n",
    local: "openRouterApiKey: local-key\n",
  });
  const service = new CredentialServiceImpl(envMock, file);

  expect((await service.getMergedCredentials()).openRouterApiKey).toBe("local-key");
});

test("getMergedCredentials - env takes precedence over file credentials", async () => {
  const file = new CredentialFileMock({
    global: "openRouterApiKey: file-key\n",
    local: "githubToken: file-token\n",
  });
  const service = new CredentialServiceImpl(envMockWithCredentials, file);

  const merged = await service.getMergedCredentials();

  expect(merged.openRouterApiKey).toBe("env-openrouter-key");
  expect(merged.githubToken).toBe("env-github-token");
});

test("getMergedCredentials - partial env override does not erase other file credentials", async () => {
  const file = new CredentialFileMock({
    global: "openRouterApiKey: file-key\ngithubToken: file-token\n",
  });
  const service = new CredentialServiceImpl(
    { ...envMock, getCredentials: () => ({ openRouterApiKey: "env-key" }) },
    file,
  );

  const merged = await service.getMergedCredentials();

  expect(merged.openRouterApiKey).toBe("env-key");
  expect(merged.githubToken).toBe("file-token");
});

test("getMergedCredentials - returns empty object when no files and no env", async () => {
  const service = new CredentialServiceImpl(envMock, new CredentialFileMock());
  expect(await service.getMergedCredentials()).toEqual({});
});

test("getMergedCredentials - returns env credentials when no files exist", async () => {
  const service = new CredentialServiceImpl(envMockWithCredentials, new CredentialFileMock());
  const merged = await service.getMergedCredentials();
  expect(merged).toEqual({ openRouterApiKey: "env-openrouter-key", githubToken: "env-github-token" });
});

// --- saveCredentials ---

test("saveCredentials - creates key in empty global file", async () => {
  const file = new CredentialFileMock();
  const service = new CredentialServiceImpl(envMock, file);

  await service.saveCredentials("global", "openRouterApiKey", "sk-new");

  const creds = await service.getGlobalCredentials();
  expect(creds.openRouterApiKey).toBe("sk-new");
});

test("saveCredentials - overwrites existing key", async () => {
  const file = new CredentialFileMock({ global: "openRouterApiKey: old-key\n" });
  const service = new CredentialServiceImpl(envMock, file);

  await service.saveCredentials("global", "openRouterApiKey", "new-key");

  expect((await service.getGlobalCredentials()).openRouterApiKey).toBe("new-key");
});

test("saveCredentials - works with local scope", async () => {
  const file = new CredentialFileMock();
  const service = new CredentialServiceImpl(envMock, file);

  await service.saveCredentials("local", "githubToken", "local-token");

  expect((await service.getLocalCredentials()).githubToken).toBe("local-token");
});

test("saveCredentials - preserves existing comments", async () => {
  const file = new CredentialFileMock({
    global: [
      "# Personal credentials - do not share",
      "openRouterApiKey: old-key # replace when expired",
    ].join("\n") + "\n",
  });
  const service = new CredentialServiceImpl(envMock, file);

  await service.saveCredentials("global", "openRouterApiKey", "new-key");

  const saved = await file.load("global");
  expect(saved).toContain("# Personal credentials - do not share");
  expect(saved).toContain("# replace when expired");
  expect(saved).toContain("openRouterApiKey: new-key");
});

test("saveCredentials - adds new key without overwriting others", async () => {
  const file = new CredentialFileMock({ global: "openRouterApiKey: existing-key\n" });
  const service = new CredentialServiceImpl(envMock, file);

  await service.saveCredentials("global", "githubToken", "gh-token");

  const saved = await file.load("global");
  expect(saved).toContain("openRouterApiKey: existing-key");
  expect(saved).toContain("githubToken: gh-token");
});
