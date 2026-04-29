export type { ConfigFile } from "./model/config-file.js";
export {
  CONFIG_MERGE_LAYER_ORDER,
  type ConfigLayerPartials,
  type ConfigMergeLayer,
  mergeConfigLayers,
} from "./model/config-merge.js";
export type { ConfigScope } from "./model/config-scope.js";
export type { ConfigService, SetScalarError, SetScalarResult } from "./model/config-service.js";
export type { ConfigSetArgs } from "./model/config-set.js";
export { configSetValueSchema, formatConfigSetParseError, parseConfigSetArgs } from "./model/config-set.js";
export type { RuntimeEnv } from "./model/runtime-env.js";
export type { Config } from "./schema/config-schema.js";
export { ConfigSchema, DEFAULT_CONFIG } from "./schema/config-schema.js";
export type { GlobalConfig } from "./schema/global-config-schema.js";
export { GlobalConfigSchema } from "./schema/global-config-schema.js";
export type { LocalConfig } from "./schema/local-config-schema.js";
export { LocalConfigSchema } from "./schema/local-config-schema.js";
export type { ProjectConfig } from "./schema/project-config-schema.js";
export { ProjectConfigSchema } from "./schema/project-config-schema.js";
