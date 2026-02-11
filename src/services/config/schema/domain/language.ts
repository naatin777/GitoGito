import z from "zod";

export const LanguageSchema = z.object({
  dialogue: z.string().describe("Language used for interactive dialogue."),
  output: z.string().describe("Language used for generated output."),
}).describe("Language configuration.");

type Language = z.infer<typeof LanguageSchema>;

export const DEFAULT_LANGUAGE: Language = {
  dialogue: "English",
  output: "English",
};
