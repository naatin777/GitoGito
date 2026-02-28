import { z } from "zod";
import { AiConfigSchema, DEFAULT_AI_CONFIG } from "./domain/ai.ts";
import { ColorConfigSchema, DEFAULT_COLOR_CONFIG } from "./domain/color.ts";
import { CommitConfigSchema, DEFAULT_COMMIT_CONFIG } from "./domain/commit.ts";
import { DEFAULT_LANGUAGE, LanguageSchema } from "./domain/language.ts";
import { DEFAULT_THEME_CONFIG, ThemeConfigSchema } from "./domain/theme.ts";

export const ConfigSchema = z.object({
  ai: AiConfigSchema.default(DEFAULT_AI_CONFIG).describe("AI settings."),
  language: LanguageSchema.default(DEFAULT_LANGUAGE).describe(
    "Language settings.",
  ),
  commit: CommitConfigSchema.default(DEFAULT_COMMIT_CONFIG).describe(
    "Commit settings.",
  ),
  color: ColorConfigSchema.default(DEFAULT_COLOR_CONFIG).describe(
    "Color settings.",
  ),
  theme: ThemeConfigSchema.default(DEFAULT_THEME_CONFIG).describe(
    "Theme settings.",
  ),
}).describe("Root configuration schema.");

export type Config = z.infer<typeof ConfigSchema>;
