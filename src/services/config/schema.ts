import { z } from "zod";
import { AI_PROVIDER } from "../../constants/ai.ts";

export const SuggestionSchema = z.object({
  value: z.string(),
  description: z.string(),
  emoji: z.string().optional(),
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
  ai: AiSchema,
  language: z.string(),
  editor: z.string(),
  overview: z.string(),
  commit: CommitSchema,
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
