import { ConfigSchema, type Config, DEFAULT_CONFIG } from "./config_schema.ts";

export const ProjectConfigSchema = ConfigSchema.describe(
  "Project config schema. Stored in .gitogito.yml (shared with team).",
);

export type ProjectConfig = Config;

export const DEFAULT_PROJECT_CONFIG: ProjectConfig = DEFAULT_CONFIG;
