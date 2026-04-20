import z from "zod";

const AnsiSchema = z.object({
  black: z.string(),
  red: z.string(),
  green: z.string(),
  yellow: z.string(),
  blue: z.string(),
  magenta: z.string(),
  cyan: z.string(),
  white: z.string(),
  bright_black: z.string(),
  bright_red: z.string(),
  bright_green: z.string(),
  bright_yellow: z.string(),
  bright_blue: z.string(),
  bright_magenta: z.string(),
  bright_cyan: z.string(),
  bright_white: z.string(),
})

export type AnsiSchemaType = z.infer<typeof AnsiSchema>;
export const AnsiSchemaKeyof = AnsiSchema.keyof().options;
