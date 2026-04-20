import { z } from "zod";
import { ConfigSchema } from "./config_schema.ts";

export const GlobalConfigSchema = ConfigSchema.omit({ commit: true }).describe(
  "Global config schema. Stored in ~/.config/gitogito/config.yml.",
);

export type GlobalConfig = z.infer<typeof GlobalConfigSchema>;

export const DEFAULT_GLOBAL_CONFIG: GlobalConfig = GlobalConfigSchema.parse({});
