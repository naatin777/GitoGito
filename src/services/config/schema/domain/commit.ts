import { z } from "zod";

export const CommitConfigSchema = z.object({
  rules: z.object({
    maxHeaderLength: z.number().describe(
      "Maximum number of characters allowed in commit header.",
    ),
    requireScope: z.boolean().describe(
      "Whether commit scope is required when creating commit messages.",
    ),
  }).describe("Rules for validating commit message format."),
  type: z.array(
    z.object({
      value: z.string().describe("Commit type value (e.g. feat, fix)."),
      description: z.string().describe("Human-readable explanation of the commit type."),
      emoji: z.string().optional().describe("Optional emoji for the commit type."),
    }),
  ).describe("Available commit types."),
  scope: z.array(
    z.string().describe("Allowed commit scope name."),
  ).describe("Allowed commit scopes."),
}).describe("Commit message configuration.");

export type CommitConfig = z.infer<typeof CommitConfigSchema>;

export const DEFAULT_COMMIT_CONFIG: CommitConfig = {
  rules: {
    maxHeaderLength: 72,
    requireScope: true,
  },
  type: [],
  scope: [],
} as const;
