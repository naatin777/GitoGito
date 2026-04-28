import type { z } from "zod";
import { ConfigSchema } from "./config_schema.js";

/**
 * User-wide config: paths like `~/.config/<app>/config.yaml`.
 * In the full merge stack, applied **second** (after `DEFAULT_CONFIG`, before project and local).
 * Excludes `ai` so provider/model are not global-only; adjust omits as product rules change.
 */
export const GlobalConfigSchema = ConfigSchema;

export type GlobalConfig = z.infer<typeof GlobalConfigSchema>;
