import { z } from "zod";
import { AI_PROVIDER } from "../../../../constants/ai.ts";

export const AiSchema = z.object({
  provider: z.enum(AI_PROVIDER),
  model: z.string(),
});

export type Ai = z.infer<typeof AiSchema>;
