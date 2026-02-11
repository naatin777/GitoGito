import { z } from "zod";

export const CredentialsSchema = z.object({
  aiApiKey: z.string().optional().describe("API key for AI provider access."),
  githubToken: z.string().optional().describe("GitHub personal access token."),
}).describe("Credentials configuration.");

export type Credentials = z.infer<typeof CredentialsSchema>;
