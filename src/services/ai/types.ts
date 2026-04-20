import type { AiConfig, AiModel } from "../config/schema/fields/ai_schema.ts";

export type AiTask = keyof Omit<AiConfig, "default">;
export type AiProvider = AiModel["provider"];
export type RuntimeAiProvider = "Ollama" | "OpenRouter" | "Gemini";

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export type UsageCallback = (usage: TokenUsage) => void;
