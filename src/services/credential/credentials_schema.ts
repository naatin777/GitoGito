import { z } from "zod";

export const CredentialsSchema = z.object({
  openRouterApiKey: z.string().optional().describe("API key for OpenRouter."),
  geminiApiKey: z.string().optional().describe("API key for Google Gemini."),
  githubToken: z.string().optional().describe("GitHub personal access token."),
}).describe("Credentials configuration.");

export type Credentials = z.infer<typeof CredentialsSchema>;
