import { expect, test } from "bun:test";
import type { ConfigFile, ConfigScope } from "./config_file.ts";
import { ConfigServiceImpl } from "./config_service.ts";

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

// --- getMergedConfig ---

test("getMergedConfig - deeply merges nested config with defaults", async () => {
  const file = new ConfigFileMock({
    global: "ai:\n  default:\n    provider: OpenRouter\n",
    project: "ai:\n  default:\n    model: project-model\n",
    local: "commit:\n  rules:\n    requireScope: false\n",
  });
  const service = new ConfigServiceImpl(file);

  const merged = await service.getMergedConfig();

  expect(merged.ai.default.provider).toBe("OpenRouter");
  expect(merged.ai.default.model).toBe("project-model");
  expect(merged.commit.rules.maxHeaderLength).toBe(72);
  expect(merged.commit.rules.requireScope).toBe(false);
});

test("getMergedConfig - credentials field in file is ignored", async () => {
  const file = new ConfigFileMock({
    global: "ai:\n  default:\n    provider: OpenRouter\ncredentials:\n  openRouterApiKey: sk-secret\n",
  });
  const service = new ConfigServiceImpl(file);

  const merged = await service.getMergedConfig();

  expect("credentials" in merged).toBe(false);
  expect((merged as Record<string, unknown>).openRouterApiKey).toBeUndefined();
});

// --- getGlobalConfig ---

test("getGlobalConfig - returns ai/language/theme fields (no commit, no credentials)", async () => {
  const file = new ConfigFileMock({
    global: "ai:\n  default:\n    provider: OpenRouter\n    model: gpt-4o\nlanguage:\n  dialogue: Japanese\n",
  });
  const service = new ConfigServiceImpl(file);

  const global = await service.getGlobalConfig();

  expect(global.ai?.default.provider).toBe("OpenRouter");
  expect(global.language?.dialogue).toBe("Japanese");
  expect((global as Record<string, unknown>).credentials).toBeUndefined();
  expect((global as Record<string, unknown>).commit).toBeUndefined();
});

test("getGlobalConfig - returns empty object for empty file", async () => {
  const service = new ConfigServiceImpl(new ConfigFileMock());
  const global = await service.getGlobalConfig();
  expect(global).toEqual({});
});

// --- getProjectConfig ---

test("getProjectConfig - returns commit field", async () => {
  const file = new ConfigFileMock({
    project: "commit:\n  rules:\n    requireScope: true\n  scope:\n    - api\n    - ui\n",
  });
  const service = new ConfigServiceImpl(file);

  const project = await service.getProjectConfig();

  expect(project.commit?.rules.requireScope).toBe(true);
  expect(project.commit?.scope).toEqual(["api", "ui"]);
});

// --- getLocalConfig ---

test("getLocalConfig - returns overrides without credentials", async () => {
  const file = new ConfigFileMock({
    local: "ai:\n  default:\n    provider: Gemini\n    model: gemini-pro\n",
  });
  const service = new ConfigServiceImpl(file);

  const local = await service.getLocalConfig();

  expect(local.ai?.default.provider).toBe("Gemini");
  expect((local as Record<string, unknown>).credentials).toBeUndefined();
});

// --- saveConfig ---

test("saveConfig - preserves existing comments", async () => {
  const file = new ConfigFileMock({
    project: [
      "# AI settings",
      "ai:",
      "  default:",
      "    provider: Ollama # current provider",
      "    model: qwen3.5:9b",
    ].join("\n") + "\n",
  });
  const service = new ConfigServiceImpl(file);

  await service.saveConfig("project", "ai.default.model", "llama3");

  const saved = await file.load("project");
  expect(saved).toContain("# AI settings");
  expect(saved).toContain("# current provider");
  expect(saved).toContain("model: llama3");
  expect(saved).toContain("provider: Ollama");
});

test("saveConfig - creates key in empty file", async () => {
  const file = new ConfigFileMock();
  const service = new ConfigServiceImpl(file);

  await service.saveConfig("project", "ai.default.model", "new-model");

  const saved = await file.load("project");
  expect(saved).toContain("model: new-model");
});
