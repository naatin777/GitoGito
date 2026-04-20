import {
  generateObject,
  type LanguageModel,
  type ModelMessage,
  streamObject,
} from "ai";
import { z } from "zod";
import {
  createConfigService,
  type ConfigService,
} from "../config/config_service.ts";
import { AiConfigSchema } from "../config/schema/fields/ai_schema.ts";
import type { Credentials } from "../credential/credentials_schema.ts";
import {
  createCredentialService,
  type CredentialService,
} from "../credential/credential_service.ts";
import { createLanguageModel } from "./provider.ts";
import { normalizeAiProvider } from "./provider.ts";
import type { AiProvider, AiTask, UsageCallback } from "./types.ts";

export class AIService {
  protected modelCache: LanguageModel | null = null;
  protected provider: AiProvider;
  protected model: string;
  protected credentials: Partial<Credentials>;

  constructor(
    provider: AiProvider,
    model: string,
    credentials: Partial<Credentials>,
  ) {
    this.provider = provider;
    this.model = model;
    this.credentials = credentials;
  }

  static async create(
    configSource: Pick<ConfigService, "getMergedConfig"> = createConfigService(),
    credentialSource: Pick<
      CredentialService,
      "getMergedCredentials"
    > = createCredentialService(),
    task?: AiTask,
  ): Promise<AIService> {
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

    this.modelCache = createLanguageModel(this.provider, this.model, this.credentials);
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
