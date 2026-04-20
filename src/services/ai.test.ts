import { expect, test } from "bun:test";
import type { ConfigService } from "./config/config_service.ts";
import { ConfigSchema } from "./config/schema/config_schema.ts";
import type { Credentials } from "./credential/credentials_schema.ts";
import type { CredentialService } from "./credential/credential_service.ts";
import { AIService } from "./ai.ts";

class TestAIService extends AIService {
  resolveModel() {
    return this.getModel();
  }
}

function mockConfigSource(aiOverride?: object): Pick<ConfigService, "getMergedConfig"> {
  return {
    async getMergedConfig() {
      return ConfigSchema.parse(aiOverride ? { ai: aiOverride } : {});
    },
  };
}

function mockCredentialSource(credentialsOverride?: Partial<Credentials>): Pick<CredentialService, "getMergedCredentials"> {
  return {
    async getMergedCredentials() {
      return credentialsOverride ?? {};
    },
  };
}

test("AIService.create - uses the default Ollama model", async () => {
  const service = await AIService.create(mockConfigSource(), mockCredentialSource());
  expect(service.getModelId()).toBe("qwen3.5:9b");
});

test("AIService.create - uses task-specific model when configured", async () => {
  const service = await AIService.create(
    mockConfigSource({ default: { provider: "Ollama", model: "default-model" }, commit: { provider: "Ollama", model: "commit-model" } }),
    mockCredentialSource(),
    "commit",
  );
  expect(service.getModelId()).toBe("commit-model");
});

test("AIService.create - falls back to default when task has no specific model", async () => {
  const service = await AIService.create(
    mockConfigSource({ default: { provider: "Ollama", model: "default-model" } }),
    mockCredentialSource(),
    "commit",
  );
  expect(service.getModelId()).toBe("default-model");
});

test("AIService.create - loads an OpenRouter model and credentials", async () => {
  const service = await AIService.create(
    mockConfigSource({ default: { provider: "OpenRouter", model: "openai/gpt-4o" } }),
    mockCredentialSource({ openRouterApiKey: "test-key" }),
  );
  expect(service.getModelId()).toBe("openai/gpt-4o");
});

test("AIService.create - treats CodexCLI as an OpenRouter-backed provider", async () => {
  const service = await AIService.create(
    mockConfigSource({ default: { provider: "CodexCLI", model: "openai/gpt-4o" } }),
    mockCredentialSource({ openRouterApiKey: "test-key" }),
  );
  expect(service.getModelId()).toBe("openai/gpt-4o");
});

test("AIService.create - treats ClaudeCodeWithOllama as an Ollama-backed provider", async () => {
  const service = await AIService.create(
    mockConfigSource({ default: { provider: "ClaudeCodeWithOllama", model: "qwen3.5:9b" } }),
    mockCredentialSource(),
  );
  expect(service.getModelId()).toBe("qwen3.5:9b");
});

test("AIService.create - rejects OpenRouter when the API key is missing", async () => {
  await expect(
    AIService.create(
      mockConfigSource({ default: { provider: "OpenRouter", model: "openai/gpt-4o" } }),
      mockCredentialSource(),
    ),
  ).rejects.toThrow(
    "Missing OpenRouter API key. Set credentials.openRouterApiKey or GITOGITO_OPEN_ROUTER_API_KEY.",
  );
});

test("AIService.create - rejects CodexCLI when the OpenRouter API key is missing", async () => {
  await expect(
    AIService.create(
      mockConfigSource({ default: { provider: "CodexCLI", model: "openai/gpt-4o" } }),
      mockCredentialSource(),
    ),
  ).rejects.toThrow(
    "Missing OpenRouter API key. Set credentials.openRouterApiKey or GITOGITO_OPEN_ROUTER_API_KEY.",
  );
});

test("AIService.create - rejects Gemini when the API key is missing", async () => {
  await expect(
    AIService.create(
      mockConfigSource({ default: { provider: "Gemini", model: "gemini-2.0-flash" } }),
      mockCredentialSource(),
    ),
  ).rejects.toThrow(
    "Missing Gemini API key. Set credentials.geminiApiKey or GITOGITO_GEMINI_API_KEY.",
  );
});

test("AIService resolves an Ollama model once and caches it", () => {
  const service = new TestAIService("Ollama", "qwen3.5:9b", {});

  const model = service.resolveModel();

  expect(model).toBeTruthy();
  expect(service.resolveModel()).toBe(model);
});
