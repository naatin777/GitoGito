import { z } from "zod";

export const SuggestionSchema = z.object({
  value: z.string(),
  description: z.string(),
  emoji: z.string().optional(),
});

export type Suggestion = z.infer<typeof SuggestionSchema>;
