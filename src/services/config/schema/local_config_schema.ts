import { ConfigSchema, type Config, DEFAULT_CONFIG } from "./config_schema.ts";

export const LocalConfigSchema = ConfigSchema.describe(
  "Local config schema. Stored in .gitogito.local.yml (personal overrides, not git-managed).",
);

export type LocalConfig = Config;

export const DEFAULT_LOCAL_CONFIG: LocalConfig = DEFAULT_CONFIG;
