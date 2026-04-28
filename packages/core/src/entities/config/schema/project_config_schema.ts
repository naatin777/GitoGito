import type z from "zod";
import { ConfigSchema } from "./config_schema.js";

/**
 * Project / team config: e.g. `.gitogito.yaml` in the working tree.
 * Same full shape as merged config. In the full stack, order is **defaults → global → project → local** (this is the third layer).
 */
export const ProjectConfigSchema = ConfigSchema;

export type ProjectConfig = z.infer<typeof ProjectConfigSchema>;
