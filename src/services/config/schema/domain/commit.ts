import { z } from "zod";

export const CommitConfigSchema = z.object({
  rules: z.object({
    maxHeaderLength: z.number(),
    requireScope: z.boolean(),
  }),
  type: z.array(
    z.object({
      value: z.string(),
      description: z.string(),
      emoji: z.string().optional(),
    }),
  ),
  scope: z.array(z.string()),
});

export type CommitConfig = z.infer<typeof CommitConfigSchema>;

export const DEFAULT_COMMIT_CONFIG: CommitConfig = {
  rules: {
    maxHeaderLength: 72,
    requireScope: true,
  },
  type: [],
  scope: [],
} as const;
