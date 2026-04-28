import { z } from "zod";

const trimKey = z
  .string()
  .transform((s) => s.trim())
  .refine((s) => s.length > 0, { message: "Key must not be empty." })
  .refine((s) => s.split(".").every((p) => p.length > 0), {
    message: "Key must not contain empty segments; use dot-separated segments like 'section.option'.",
  });

export const configSetValueSchema = z.string().max(256_000, { message: "Value is too long." });

const configSetArgsSchema = z.object({
  key: trimKey,
  value: configSetValueSchema,
});

export type ConfigSetArgs = z.infer<typeof configSetArgsSchema>;

export function parseConfigSetArgs(input: { key: string; value: string }):
  | {
      success: true;
      data: ConfigSetArgs;
    }
  | {
      success: false;
      error: z.ZodError;
    } {
  const r = configSetArgsSchema.safeParse(input);
  if (r.success) {
    return { success: true, data: r.data };
  }
  return { success: false, error: r.error };
}

export function formatConfigSetParseError(issue: z.ZodError): string {
  return issue.issues[0]?.message ?? "Invalid key or value.";
}
