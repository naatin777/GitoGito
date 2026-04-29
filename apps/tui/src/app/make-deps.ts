import { type ConfigService, ConfigServiceImpl } from "@gitogito/core";
import packageJson from "../../package.json" with { type: "json" };
import { FsConfigFile, GitogitoConfigPathResolver, ProcessRuntimeEnv } from "../entities/config";

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
