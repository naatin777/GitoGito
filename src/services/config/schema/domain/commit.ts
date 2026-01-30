import { z } from "zod";
import { SuggestionSchema } from "./suggestion.ts";

export const CommitSchema = z.object({
  rules: z.object({
    maxHeaderLength: z.number(),
    requireScope: z.boolean(),
  }),
  type: z.array(SuggestionSchema),
  scope: z.array(SuggestionSchema),
});

export type Commit = z.infer<typeof CommitSchema>;
