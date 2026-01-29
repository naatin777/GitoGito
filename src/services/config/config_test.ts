import { assertEquals, assertRejects } from "@std/assert";
import { join } from "@std/path";
import { afterEach, beforeEach, describe, it } from "@std/testing/bdd";
import {
  ConfigSchema,
  ConfigService,
  CredentialsSchema,
  MergedConfigSchema,
} from "./config.ts";
import type { EnvService } from "./env.ts";

// モックEnvService
class MockEnvService implements EnvService {
  private envVars: Record<string, string> = {};
  private home = "/tmp/test-home";

  setEnv(key: string, value: string) {
    this.envVars[key] = value;
  }

  clearEnv() {
    this.envVars = {};
  }

  setHome(home: string) {
    this.home = home;
  }

  getHome(): string {
    return this.home;
  }

  getAiApiKey(): string {
    const key = this.envVars["AI_API_KEY"];
    if (!key) throw new Error("AI_API_KEY not found");
    return key;
  }

  getGitHubToken(): string {
    const token = this.envVars["GITHUB_TOKEN"];
    if (!token) throw new Error("GITHUB_TOKEN not found");
    return token;
  }
}

describe("ConfigService with Zod validation", () => {
  let envService: MockEnvService;
  let configService: ConfigService;
  let testDir: string;

  beforeEach(async () => {
    envService = new MockEnvService();
    configService = new ConfigService(envService);
    testDir = await Deno.makeTempDir({ prefix: "config_test_" });
  });

  afterEach(async () => {
    await Deno.remove(testDir, { recursive: true });
    envService.clearEnv();
  });

  describe("Zod Schemas", () => {
    it("should validate valid Config", () => {
      const validConfig = {
        language: "English",
        editor: "code --wait",
        overview: "Test overview",
        provider: "ChatGPT",
        model: "gpt-4",
      };

      const result = ConfigSchema.parse(validConfig);
      assertEquals(result, validConfig);
    });

    it("should reject invalid provider", async () => {
      const invalidConfig = {
        language: "English",
        editor: "code --wait",
        overview: "Test overview",
        provider: "InvalidProvider",
        model: "gpt-4",
      };

      await assertRejects(
        () => {
          ConfigSchema.parse(invalidConfig);
        },
        Error,
      );
    });

    it("should validate valid Credentials", () => {
      const validCredentials = {
        ai_api_key: "test-key",
        github_token: "test-token",
      };

      const result = CredentialsSchema.parse(validCredentials);
      assertEquals(result, validCredentials);
    });

    it("should validate MergedConfig with optional credentials", () => {
      const config = {
        language: "English",
        editor: "code --wait",
        overview: "",
        provider: "Claude",
        model: "claude-3",
      };

      const result = MergedConfigSchema.parse(config);
      assertEquals(result, config);
    });

    it("should validate MergedConfig with credentials", () => {
      const config = {
        language: "English",
        editor: "code --wait",
        overview: "",
        provider: "OpenRouter" as const,
        model: "test-model",
        ai_api_key: "test-key",
        github_token: "test-token",
      };

      const result = MergedConfigSchema.parse(config);
      assertEquals(result, config);
    });
  });

  describe("ConfigService validation", () => {
    it("should load valid config from file", async () => {
      const configPath = join(testDir, ".demmithub.yml");
      const validConfig = `language: English
editor: code --wait
overview: Test
provider: ChatGPT
model: gpt-4
`;
      await Deno.writeTextFile(configPath, validConfig);

      // 一時的にcwdを変更してテスト
      const originalCwd = Deno.cwd();
      Deno.chdir(testDir);

      try {
        const config = await configService.loadConfig("project");
        assertEquals(config.provider, "ChatGPT");
        assertEquals(config.language, "English");
      } finally {
        Deno.chdir(originalCwd);
      }
    });

    it("should reject invalid provider", async () => {
      const configPath = join(testDir, ".demmithub.yml");
      const invalidConfig = `language: English
editor: code --wait
overview: Test
provider: InvalidProvider
model: gpt-4
`;
      await Deno.writeTextFile(configPath, invalidConfig);

      const originalCwd = Deno.cwd();
      Deno.chdir(testDir);

      try {
        await assertRejects(
          async () => await configService.loadConfig("project"),
          Error,
          "Configuration validation failed",
        );
      } finally {
        Deno.chdir(originalCwd);
      }
    });

    it("should validate merged config", async () => {
      const projectConfigPath = join(testDir, ".demmithub.yml");
      const projectConfig = `
language: 日本語 (Japanese)
provider: Claude
model: claude-3
`;
      await Deno.writeTextFile(projectConfigPath, projectConfig);

      const originalCwd = Deno.cwd();
      Deno.chdir(testDir);

      try {
        const merged = await configService.getMerged();
        assertEquals(merged.language, "日本語 (Japanese)");
        assertEquals(merged.provider, "Claude");
      } finally {
        Deno.chdir(originalCwd);
      }
    });
  });

  describe("Credentials", () => {
    it("should get credentials from env vars", async () => {
      envService.setEnv("AI_API_KEY", "env-api-key");
      envService.setEnv("GITHUB_TOKEN", "env-github-token");

      const credentials = await configService.getCredentials();
      assertEquals(credentials.ai_api_key, "env-api-key");
      assertEquals(credentials.github_token, "env-github-token");
    });

    it("should prioritize env vars over config files", async () => {
      const globalConfigPath = join(testDir, ".config/demmithub/config.yml");
      await Deno.mkdir(join(testDir, ".config/demmithub"), { recursive: true });
      await Deno.writeTextFile(globalConfigPath, "ai_api_key: file-key\n", {
        mode: 0o600,
      });

      envService.setEnv("AI_API_KEY", "env-api-key");

      const originalCwd = Deno.cwd();
      const originalHome = testDir;
      Deno.chdir(testDir);

      try {
        // 新しいConfigServiceを作成（testDirをhomeとして使用）
        const mockEnvWithHome = new MockEnvService();
        mockEnvWithHome.setHome(originalHome);
        mockEnvWithHome.setEnv("AI_API_KEY", "env-api-key");
        const newConfigService = new ConfigService(mockEnvWithHome);

        const credentials = await newConfigService.getCredentials();
        assertEquals(credentials.ai_api_key, "env-api-key");
      } finally {
        Deno.chdir(originalCwd);
      }
    });
  });
});
