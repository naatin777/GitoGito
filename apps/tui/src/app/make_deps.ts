import type { ConfigService } from "@gitogito/core";
import packageJson from "../../package.json" with { type: "json" };
import { FsConfigFile } from "../features/config/config_file.js";
import { GitogitoConfigPathResolver } from "../features/config/config_paths.js";
import { ConfigServiceImpl } from "../features/config/config_service_impl.js";
import { ProcessRuntimeEnv } from "../features/infrastructure/env/process_runtime_env.js";

export interface AppDeps {
  configService: ConfigService;
}

export function makeDeps(): AppDeps {
  const env = new ProcessRuntimeEnv();
  const paths = new GitogitoConfigPathResolver(env, packageJson.displayName);
  const configFile = new FsConfigFile(paths);
  const configService = new ConfigServiceImpl(configFile);
  return { configService };
}
