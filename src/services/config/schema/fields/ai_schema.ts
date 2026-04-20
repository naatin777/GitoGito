import { z } from "zod";

export const AI_PROVIDER = [
  "Ollama",
  "OpenRouter",
  "Gemini",
  "CodexCLI",
  "ClaudeCode",
  "CodexCLIWithOllama",
  "ClaudeCodeWithOllama"
] as const;

export const AiModelSchema = z.object({
  provider: z.enum(AI_PROVIDER).describe("AI provider used for generation."),
  model: z.string().describe("Model name used by the selected AI provider."),
}).describe("AI model configuration.");

export const AiConfigSchema = z.object({
  default: AiModelSchema.describe("Default model used when no task-specific model is configured."),
  commit: AiModelSchema.optional().describe("Model used for commit message generation."),
  issue: AiModelSchema.optional().describe("Model used for issue generation."),
}).describe("AI configuration.");

export type AiModel = z.infer<typeof AiModelSchema>;
export type AiConfig = z.infer<typeof AiConfigSchema>;

export const DEFAULT_AI_MODEL: AiModel = {
  provider: "Ollama",
  model: "qwen3.5:9b",
} as const;

export const DEFAULT_AI_CONFIG: AiConfig = {
  default: DEFAULT_AI_MODEL,
} as const;
