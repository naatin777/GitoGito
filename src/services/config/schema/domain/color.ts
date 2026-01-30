import { z } from "zod";

export const ColorSchema = z.object({
  primary: z.string(),
});
