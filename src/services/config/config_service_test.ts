import { expect, test } from "bun:test";
import { ConfigServiceImpl } from "./config_service.ts";
import type { EnvService } from "./env.ts";
import type { ConfigFile, ConfigScope } from "./file.ts";

class ConfigFileMock implements ConfigFile {
  private files = new Map<ConfigScope, string>();

  constructor(seed?: Partial<Record<ConfigScope, string>>) {
    if (seed?.global) this.files.set("global", seed.global);
    if (seed?.project) this.files.set("project", seed.project);
    if (seed?.local) this.files.set("local", seed.local);
  }

  async load(configScope: ConfigScope): Promise<string> {
    return this.files.get(configScope) ?? "";
  }

  async save(configScope: ConfigScope, data: string): Promise<void> {
    this.files.set(configScope, data);
  }

  async exists(configScope: ConfigScope): Promise<boolean> {
    return this.files.has(configScope);
  }
}

const envServiceMock: EnvService = {
  getAiApiKey() {
    return undefined;
  },
  getGitHubToken() {
    return undefined;
  },
  getHome() {
    return "/tmp";
  },
};

test("getMergedConfig - deeply merges nested config with defaults", async () => {
  const file = new ConfigFileMock({
    global: "ai:\n  provider: Claude\n",
    project: "ai:\n  model: project-model\n",
    local: "commit:\n  rules:\n    requireScope: false\n",
  });
  const service = new ConfigServiceImpl(envServiceMock, file);

  const merged = await service.getMergedConfig();

  expect(merged.ai.provider).toBe("Claude");
  expect(merged.ai.model).toBe("project-model");
  expect(merged.commit.rules.maxHeaderLength).toBe(72);
  expect(merged.commit.rules.requireScope).toBe(false);
});
