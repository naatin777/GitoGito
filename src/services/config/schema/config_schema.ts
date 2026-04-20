import { z } from "zod";
import { AiConfigSchema, DEFAULT_AI_CONFIG } from "./fields/ai_schema.ts";
import { CommitConfigSchema, DEFAULT_COMMIT_CONFIG } from "./fields/commit_schema.ts";
import { DEFAULT_LANGUAGE, LanguageSchema } from "./fields/language_schema.ts";
import { DEFAULT_THEME_CONFIG, ThemeConfigSchema } from "./fields/theme_schema.ts";

export const ConfigSchema = z.object({
  ai: AiConfigSchema.default(DEFAULT_AI_CONFIG).describe("AI settings."),
  language: LanguageSchema.default(DEFAULT_LANGUAGE).describe("Language settings."),
  commit: CommitConfigSchema.default(DEFAULT_COMMIT_CONFIG).describe("Commit settings."),
  theme: ThemeConfigSchema.default(DEFAULT_THEME_CONFIG).describe("Theme settings."),
}).describe("Root configuration schema. Represents the fully merged config.");

export type Config = z.infer<typeof ConfigSchema>;

export const DEFAULT_CONFIG: Config = ConfigSchema.parse({});
