import type z from "zod";
import { ConfigSchema } from "./config_schema.js";

/**
 * Local overrides: e.g. `.gitogito.local.yaml` (often git-ignored).
 * Same field set as the merged tree. In the full stack, this layer is applied **last** (after defaults, global, project).
 */
export const LocalConfigSchema = ConfigSchema;

export type LocalConfig = z.infer<typeof LocalConfigSchema>;
