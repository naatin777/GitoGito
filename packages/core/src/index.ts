export { MemoryRuntimeEnv } from "../tests/memory-runtime-env.js";
export type {
  Config,
  ConfigFile,
  ConfigScope,
  ConfigService,
  ConfigSetArgs,
  GlobalConfig,
  LocalConfig,
  ProjectConfig,
  RuntimeEnv,
  SetScalarError,
  SetScalarResult,
} from "./entities/config/index.js";
export {
  CONFIG_MERGE_LAYER_ORDER,
  type ConfigLayerPartials,
  type ConfigMergeLayer,
  ConfigSchema,
  configSetValueSchema,
  DEFAULT_CONFIG,
  formatConfigSetParseError,
  GlobalConfigSchema,
  LocalConfigSchema,
  mergeConfigLayers,
  ProjectConfigSchema,
  parseConfigSetArgs,
} from "./entities/config/index.js";
export { ConfigServiceImpl } from "./features/config/index.js";
