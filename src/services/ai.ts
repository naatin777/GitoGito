import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import {
  generateObject,
  type LanguageModel,
  type ModelMessage,
  streamObject,
} from "ai";
import { z } from "zod";
import type { AI_PROVIDER_KEY } from "../constants/ai.ts";
import { envService } from "./config/env.ts";
import { ConfigService } from "./config/index.ts";

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export type UsageCallback = (usage: TokenUsage) => void;

export class AIService {
  protected modelCache: LanguageModel | null = null;
  protected provider: AI_PROVIDER_KEY;
  protected model: string;
  protected aiApiKey: string;

  constructor(
    provider: AI_PROVIDER_KEY,
    model: string,
    aiApiKey: string,
  ) {
    this.provider = provider;
    this.model = model;
    this.aiApiKey = aiApiKey;
  }

  static async create() {
    const configService = new ConfigService(envService);
    const config = await configService.getMerged();
    const provider = config.provider;
    const model = config.model;
    const aiApiKey = await configService.getAiApiKey();
    return new AIService(provider, model, aiApiKey);
  }

  protected getModel(): LanguageModel {
    if (this.modelCache) {
      return this.modelCache;
    }

    switch (this.provider) {
      case "OpenRouter": {
        const openrouter = createOpenRouter({
          apiKey: this.aiApiKey,
        });
        this.modelCache = openrouter(this.model);
        break;
      }
      case "ChatGPT":
      case "Claude":
      case "Google Gemini":
        throw new Error(`Unknown provider: ${this.provider}`);
    }

    return this.modelCache!;
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
