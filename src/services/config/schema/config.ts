import { z } from "zod";
import { AiSchema } from "./domain/ai.ts";
import { ColorSchema } from "./domain/color.ts";
import { CommitSchema } from "./domain/commit.ts";
import { ThemeSchema } from "./domain/theme.ts";

export const ConfigSchema = z.object({
  ai: AiSchema.default({ provider: "ChatGPT", model: "gpt-4o" }),
  language: z.string().default("English"),
  editor: z.string().default("zed --wait"),
  overview: z.string().default(""),
  commit: CommitSchema.default({
    rules: { maxHeaderLength: 50, requireScope: false },
    type: [],
    scope: [],
  }),
  color: ColorSchema.optional(),
  theme: ThemeSchema.optional(),
});

export type Color = z.infer<typeof ColorSchema>;
export type Theme = z.infer<typeof ThemeSchema>;
export type Config = z.infer<typeof ConfigSchema>;
