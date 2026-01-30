import { z } from "zod";

export const ThemeSchema = z.object({
  mode: z.enum(["dark", "light", "custom"]),
});
