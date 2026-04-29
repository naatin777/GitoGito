import { merge } from "es-toolkit/object";
import type { Config } from "../schema/config-schema.js";
import { ConfigSchema, DEFAULT_CONFIG } from "../schema/config-schema.js";
import type { GlobalConfig } from "../schema/global-config-schema.js";
import type { LocalConfig } from "../schema/local-config-schema.js";
import type { ProjectConfig } from "../schema/project-config-schema.js";

/**
 * Merge order (later wins on deep paths): **defaults → global → project → local**.
 * Matches the in-app `getMergedConfig` pattern: deep-merge defaults, then global, project, local in order.
 */
export const CONFIG_MERGE_LAYER_ORDER = ["defaults", "global", "project", "local"] as const;

export type ConfigMergeLayer = (typeof CONFIG_MERGE_LAYER_ORDER)[number];

export type ConfigLayerPartials = {
  /** From `DEFAULT_CONFIG` / `ConfigSchema` — usually omitted so built-in defaults apply. */
  defaults?: Config;
  global?: Partial<GlobalConfig>;
  project?: Partial<ProjectConfig>;
  local?: Partial<LocalConfig>;
};

/**
 * Deep-merge config layers into one effective `Config`, then validate with `ConfigSchema`.
 */
export function mergeConfigLayers(part: ConfigLayerPartials): Config {
  const merged: Record<string, unknown> = {};
  merge(merged, part.defaults ?? DEFAULT_CONFIG);
  merge(merged, part.global ?? {});
  merge(merged, part.project ?? {});
  merge(merged, part.local ?? {});
  return ConfigSchema.parse(merged);
}
