import { expect, mock, test } from "bun:test";
import { Command } from "@cliffy/command";
import type { AppDependencies } from "../app/store.ts";
import type { ConfigScope } from "../services/config/config_file.ts";
import type { ConfigService } from "../services/config/config_service.ts";
import type { Config } from "../services/config/schema/config_schema.ts";
import type { GlobalConfig } from "../services/config/schema/global_config_schema.ts";
import type { LocalConfig } from "../services/config/schema/local_config_schema.ts";
import type { ProjectConfig } from "../services/config/schema/project_config_schema.ts";
import type { NestedKeys, PathValue } from "../type.ts";

mock.module("../lib/runner.tsx", () => ({
  runFullScreenTui: mock(() => Promise.resolve()),
}));
mock.module("../app/router.tsx", () => ({
  AppRouter: () => null,
}));

const { buildSubcommands } = await import("./config.tsx");
const { flatSchema } = await import("../helpers/flat_schema.ts");
const { ConfigSchema } = await import("../services/config/schema/config_schema.ts");

function makeSaveConfig() {
  return mock((_scope: ConfigScope, _key: NestedKeys<Config>, _value: PathValue<Config, NestedKeys<Config>>) =>
    Promise.resolve(),
  );
}

function buildTestCommand(saveConfig = makeSaveConfig()) {
  const mockConfigService: ConfigService = {
    saveConfig,
    getMergedConfig: mock(() => Promise.resolve({} as Config)),
    getGlobalConfig: mock(() => Promise.resolve({} as Partial<GlobalConfig>)),
    getProjectConfig: mock(() => Promise.resolve({} as Partial<ProjectConfig>)),
    getLocalConfig: mock(() => Promise.resolve({} as Partial<LocalConfig>)),
  };

  const mockDependencies: AppDependencies = {
    env: {
      getCredentials: mock(() => ({})),
      getNoColor: mock(() => false),
      getHome: mock(() => "/tmp"),
    },
    config: mockConfigService,
    credentials: {
      getGlobalCredentials: mock(() => Promise.resolve({})),
      getLocalCredentials: mock(() => Promise.resolve({})),
      getMergedCredentials: mock(() => Promise.resolve({})),
      saveCredentials: mock(() => Promise.resolve()),
    },
    gitRemoteRepository: {
      getOwnerAndRepo: mock(() => Promise.resolve({ owner: "o", repo: "r" })),
    },
  };

  const root = new Command()
    .throwErrors()
    .globalOption("--project", "Project scope.", { conflicts: ["local", "global"] })
    .globalOption("--local", "Local scope.", { conflicts: ["project", "global"] })
    .globalOption("--global", "Global scope.", { conflicts: ["project", "local"] });

  buildSubcommands(root, flatSchema(ConfigSchema), mockDependencies);

  return { root, mockConfigService };
}

test("ai サブコマンドが存在する", () => {
  const { root } = buildTestCommand();
  const sub = root.getCommand("ai");
  expect(sub).toBeDefined();
});

test("--set でサブコマンドの saveConfig が呼ばれる", async () => {
  const saveConfig = makeSaveConfig();
  const { root } = buildTestCommand(saveConfig);

  await root.parse(["ai", "default", "provider", "--set", "openai"]);

  expect(saveConfig).toHaveBeenCalledTimes(1);
  expect(saveConfig.mock.calls[0][0]).toBe("project");
  expect(String(saveConfig.mock.calls[0][1])).toBe("ai.default.provider");
  expect(saveConfig.mock.calls[0][2]).toBe("openai");
});

test("--global で saveConfig に global スコープが渡される", async () => {
  const saveConfig = makeSaveConfig();
  const { root } = buildTestCommand(saveConfig);

  await root.parse(["--global", "ai", "default", "provider", "--set", "anthropic"]);

  expect(saveConfig.mock.calls[0][0]).toBe("global");
});

test("--local で saveConfig に local スコープが渡される", async () => {
  const saveConfig = makeSaveConfig();
  const { root } = buildTestCommand(saveConfig);

  await root.parse(["--local", "ai", "default", "provider", "--set", "anthropic"]);

  expect(saveConfig.mock.calls[0][0]).toBe("local");
});

test("--global と --local を同時に指定するとエラー", async () => {
  const { root } = buildTestCommand();
  await expect(root.parse(["--global", "--local", "ai", "default", "provider", "--set", "x"])).rejects.toThrow();
});

test("--project と --global を同時に指定するとエラー", async () => {
  const { root } = buildTestCommand();
  await expect(root.parse(["--project", "--global", "ai", "default", "provider", "--set", "x"])).rejects.toThrow();
});
