import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import {
  generateObject,
  type LanguageModel,
  type ModelMessage,
  streamObject,
} from "ai";
import { ollama } from "ollama-ai-provider-v2";
import { z } from "zod";
import type { ConfigService } from "./config/config_service.ts";
import { configService } from "./config/config_service.ts";
import { type AiConfig, AiConfigSchema, type AiModel } from "./config/schema/fields/ai_schema.ts";
import type { Credentials } from "./credential/credentials_schema.ts";
import { type CredentialService, credentialService } from "./credential/credential_service.ts";

export type AiTask = keyof Omit<AiConfig, "default">;
type RuntimeAiProvider = "Ollama" | "OpenRouter" | "Gemini";

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export type UsageCallback = (usage: TokenUsage) => void;

export class AIService {
  protected modelCache: LanguageModel | null = null;
  protected provider: AiModel["provider"];
  protected model: string;
  protected credentials: Partial<Credentials>;

  constructor(
    provider: AiModel["provider"],
    model: string,
    credentials: Partial<Credentials>,
  ) {
    this.provider = provider;
    this.model = model;
    this.credentials = credentials;
  }

  static async create(
    configSource: Pick<ConfigService, "getMergedConfig"> = configService,
    credentialSource: Pick<CredentialService, "getMergedCredentials"> = credentialService,
    task?: AiTask,
  ) {
    const mergedConfig = await configSource.getMergedConfig();
    const mergedCredentials = await credentialSource.getMergedCredentials();
    const aiConfig = AiConfigSchema.parse(mergedConfig.ai);
    const { provider, model } = (task && aiConfig[task]) ?? aiConfig.default;
    const runtimeProvider = normalizeAiProvider(provider);

    if (runtimeProvider === "OpenRouter" && !mergedCredentials.openRouterApiKey) {
      throw new Error(
        "Missing OpenRouter API key. Set credentials.openRouterApiKey or GITOGITO_OPEN_ROUTER_API_KEY.",
      );
    }
    if (runtimeProvider === "Gemini" && !mergedCredentials.geminiApiKey) {
      throw new Error(
        "Missing Gemini API key. Set credentials.geminiApiKey or GITOGITO_GEMINI_API_KEY.",
      );
    }

    return new AIService(provider, model, mergedCredentials);
  }

  protected getModel(): LanguageModel {
    if (this.modelCache) {
      return this.modelCache;
    }

    const runtimeProvider = normalizeAiProvider(this.provider);

    switch (runtimeProvider) {
      case "Ollama":
        this.modelCache = ollama(this.model);
        break;
      case "OpenRouter": {
        const openrouter = createOpenRouter({
          apiKey: this.credentials.openRouterApiKey,
        });
        this.modelCache = openrouter(this.model);
        break;
      }
      case "Gemini": {
        const google = createGoogleGenerativeAI({
          apiKey: this.credentials.geminiApiKey,
        });
        this.modelCache = google(this.model);
        break;
      }
    }

    return this.modelCache;
  }

  getModelId(): string {
    return this.model;
  }

  async generateStructuredOutput<T extends z.ZodType>(
    messages: ModelMessage[],
    system: string,
    schema: T,
    onUsage?: UsageCallback,
  ) {
    const result = await generateObject({
      model: this.getModel(),
      system: system,
      messages: messages,
      schema: schema,
    });

    // Track token usage if callback provided
    if (onUsage && result.usage) {
      onUsage({
        inputTokens: result.usage.inputTokens || 0,
        outputTokens: result.usage.outputTokens || 0,
        totalTokens: result.usage.totalTokens || 0,
      });
    }

    return result.object;
  }

  async streamStructuredArrayOutput<T extends z.ZodType>(
    messages: ModelMessage[],
    system: string,
    schema: T,
    onUsage?: UsageCallback,
  ) {
    const result = await streamObject({
      model: this.getModel(),
      system: system,
      messages: messages,
      output: "array",
      schema: schema,
    });

    // Track usage when stream completes
    if (onUsage) {
      result.usage.then((usage) => {
        onUsage({
          inputTokens: usage.inputTokens || 0,
          outputTokens: usage.outputTokens || 0,
          totalTokens: usage.totalTokens || 0,
        });
      });
    }

    return result.elementStream;
  }
}

function normalizeAiProvider(provider: AiModel["provider"]): RuntimeAiProvider {
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

if (import.meta.main) {
  const aiService = await AIService.create();
  const result = await aiService.generateStructuredOutput(
    [
      {
        role: "user",
        content: "Hello, how are you? please output a lot of your thoughts",
      },
    ],
    "Randomly output 10 patterns of success or failure",
    z.object({
      patterns: z.array(
        z.discriminatedUnion("type", [
          z.object({ type: z.literal("success"), message: z.string() }),
          z.object({ type: z.literal("error"), code: z.number() }),
        ]),
      ),
    }),
  );
  console.log(result);

  const resultStream = await aiService.streamStructuredArrayOutput(
    [
      {
        role: "user",
        content: "Hello, how are you? please output a lot of your thoughts",
      },
    ],
    "Randomly output 10 patterns of success or failure",
    z.discriminatedUnion("type", [
      z.object({ type: z.literal("success"), message: z.string() }),
      z.object({ type: z.literal("error"), code: z.number() }),
    ]),
  );
  for await (const chunk of resultStream) {
    console.log(chunk);
  }
}
