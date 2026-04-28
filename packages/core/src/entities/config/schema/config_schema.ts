import { z } from "zod";

export const ConfigSchema = z
  .object({
    language: z
      .object({
        dialogue: z.string().default("en").describe("Language for interactive UI copy."),
        output: z.string().default("en").describe("Language for generated text."),
      })
      .describe("Language preferences."),
  })
  .describe("Full merged configuration (single source of truth for the tree).");

export type Config = z.infer<typeof ConfigSchema>;

export const DEFAULT_CONFIG: Config = ConfigSchema.parse({});
