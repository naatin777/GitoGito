import { z } from "zod";

export const AiConfigSchema = z.object({
  provider: z.enum([
    "OpenRouter",
    "ChatGPT",
    "Claude",
    "Google Gemini",
  ]).describe("AI provider used for generation."),
  model: z.string().describe("Model name used by the selected AI provider."),
}).describe("AI configuration.");

export type AiConfig = z.infer<typeof AiConfigSchema>;

export const DEFAULT_AI_CONFIG: AiConfig = {
  provider: "ChatGPT",
  model: "gpt-4o",
} as const;
