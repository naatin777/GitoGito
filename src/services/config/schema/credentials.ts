import { z } from "zod";

export const CredentialsSchema = z.object({
  aiApiKey: z.string().optional(),
  githubToken: z.string().optional(),
});

export type Credentials = z.infer<typeof CredentialsSchema>;
