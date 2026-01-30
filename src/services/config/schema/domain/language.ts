import z from "zod";

export const LanguageSchema = z.object({
  dialogue: z.string(),
  output: z.string(),
});

type Language = z.infer<typeof LanguageSchema>;

export const DEFAULT_LANGUAGE: Language = {
  dialogue: "English",
  output: "English",
};
