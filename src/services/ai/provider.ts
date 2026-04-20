import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import type { LanguageModel } from "ai";
import { ollama } from "ollama-ai-provider-v2";
import type { Credentials } from "../credential/credentials_schema.ts";
import type { AiProvider, RuntimeAiProvider } from "./types.ts";

export function normalizeAiProvider(provider: AiProvider): RuntimeAiProvider {
  switch (provider) {
    case "Ollama":
    case "CodexCLIWithOllama":
    case "ClaudeCodeWithOllama":
      return "Ollama";
    case "OpenRouter":
    case "CodexCLI":
    case "ClaudeCode":
      return "OpenRouter";
    case "Gemini":
      return "Gemini";
  }
}

export function createLanguageModel(
  provider: AiProvider,
  model: string,
  credentials: Partial<Credentials>,
): LanguageModel {
  const runtimeProvider = normalizeAiProvider(provider);
  switch (runtimeProvider) {
    case "Ollama":
      return ollama(model);
    case "OpenRouter": {
      const openrouter = createOpenRouter({
        apiKey: credentials.openRouterApiKey,
      });
      return openrouter(model);
    }
    case "Gemini": {
      const google = createGoogleGenerativeAI({
        apiKey: credentials.geminiApiKey,
      });
      return google(model);
    }
  }
}
