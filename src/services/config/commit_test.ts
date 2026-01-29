import { assertEquals } from "@std/assert";
import { DEFAULT_COMMIT_CONFIG } from "../config/index.ts";
import { CommitConfigProvider } from "./commit.ts";

Deno.test("CommitConfigProvider - uses default config when no custom config provided", async () => {
  const provider = new CommitConfigProvider();
  const config = await provider.getConfig();

  assertEquals(config.rules.maxHeaderLength, 50);
  assertEquals(config.rules.requireScope, false);
  assertEquals(config.type.length, DEFAULT_COMMIT_CONFIG.type.length);
  assertEquals(config.scope.length, DEFAULT_COMMIT_CONFIG.scope.length);
});

Deno.test("CommitConfigProvider - uses custom config when provided", async () => {
  const customConfig = {
    rules: {
      maxHeaderLength: 72,
      requireScope: true,
    },
    type: [
      { value: "custom", description: "Custom type" },
    ],
    scope: [
      { value: "backend", description: "Backend code" },
    ],
  };

  const provider = new CommitConfigProvider(customConfig);
  const config = await provider.getConfig();

  assertEquals(config.rules.maxHeaderLength, 72);
  assertEquals(config.rules.requireScope, true);
  assertEquals(config.type.length, 1);
  assertEquals(config.scope.length, 1);
});

Deno.test("CommitConfigProvider - getTypes returns commit types", async () => {
  const customConfig = {
    rules: {
      maxHeaderLength: 50,
      requireScope: false,
    },
    type: [
      { value: "custom", description: "Custom type" },
      { value: "feature", description: "New feature" },
    ],
    scope: [],
  };

  const provider = new CommitConfigProvider(customConfig);
  const types = await provider.getTypes();

  assertEquals(types.length, 2);
  assertEquals(types[0].value, "custom");
  assertEquals(types[1].value, "feature");
});

Deno.test("CommitConfigProvider - getScopes returns commit scopes", async () => {
  const customConfig = {
    rules: {
      maxHeaderLength: 50,
      requireScope: false,
    },
    type: [],
    scope: [
      { value: "backend", description: "Backend code" },
      { value: "frontend", description: "Frontend code" },
    ],
  };

  const provider = new CommitConfigProvider(customConfig);
  const scopes = await provider.getScopes();

  assertEquals(scopes.length, 2);
  assertEquals(scopes[0].value, "backend");
  assertEquals(scopes[1].value, "frontend");
});

Deno.test("CommitConfigProvider - getRules returns commit rules", async () => {
  const customConfig = {
    rules: {
      maxHeaderLength: 100,
      requireScope: true,
    },
    type: [],
    scope: [],
  };

  const provider = new CommitConfigProvider(customConfig);
  const rules = await provider.getRules();

  assertEquals(rules.maxHeaderLength, 100);
  assertEquals(rules.requireScope, true);
});

Deno.test("CommitConfigProvider - updateConfig replaces configuration", async () => {
  const provider = new CommitConfigProvider();

  // 初期状態
  const initialRules = await provider.getRules();
  assertEquals(initialRules.maxHeaderLength, 50);

  // 設定を更新
  provider.updateConfig({
    rules: {
      maxHeaderLength: 100,
      requireScope: true,
    },
    type: [],
    scope: [],
  });

  // 更新された値を確認
  const rules = await provider.getRules();
  assertEquals(rules.maxHeaderLength, 100);
  assertEquals(rules.requireScope, true);
});
