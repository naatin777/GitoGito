import { z } from "zod";
import { AI_PROVIDER } from "../../constants/ai.ts";

export const SuggestionSchema = z.object({
  value: z.string(),
  description: z.string(),
  emoji: z.string().optional(),
});

export const ColorSchema = z.object({
  primary: z.string(),
});

export const ThemeSchema = z.object({
  mode: z.enum(["dark", "light", "custom"]),
});

export const CommitSchema = z.object({
  rules: z.object({
    maxHeaderLength: z.number(),
    requireScope: z.boolean(),
  }),
  type: z.array(SuggestionSchema),
  scope: z.array(SuggestionSchema),
});

export const AiSchema = z.object({
  provider: z.enum(AI_PROVIDER),
  model: z.string(),
});

export const ConfigSchema = z.object({
  ai: AiSchema.default({ provider: "ChatGPT", model: "gpt-4o" }),
  language: z.string().default("English"),
  editor: z.string().default("zed --wait"),
  overview: z.string().default(""),
  commit: CommitSchema.default({
    rules: { maxHeaderLength: 50, requireScope: false },
    type: [],
    scope: [],
  }),
});

export const CredentialsSchema = z.object({
  ai_api_key: z.string().optional(),
  github_token: z.string().optional(),
});

export const AppConfigSchema = z.object({
  ...ConfigSchema.shape,
  credentials: CredentialsSchema,
});

export type Config = z.infer<typeof ConfigSchema>;
export type Credentials = z.infer<typeof CredentialsSchema>;
export type AppConfig = z.infer<typeof AppConfigSchema>;
