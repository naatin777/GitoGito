import { YAML } from "bun";
import _ from "lodash";
import type { ConfigScope } from "../services/config/file.ts";
import { type Config, ConfigSchema } from "../services/config/schema/config.ts";

export type ConfigScopeOptions = {
  project?: boolean;
  local?: boolean;
  global?: boolean;
};

type NormalizedConfigValue =
  | { ok: true; value: unknown }
  | { ok: false; message: string };

export function resolveConfigScope(options: ConfigScopeOptions): ConfigScope {
  if (options.global) return "global";
  if (options.local) return "local";
  return "project";
}

export function parseCliConfigValue(raw: string): unknown {
  const trimmed = raw.trim();
  try {
    const parsed = YAML.parse(raw);
    if (parsed === null && trimmed !== "null" && trimmed !== "~") {
      return raw;
    }
    return parsed;
  } catch {
    return raw;
  }
}

export function normalizeConfigValue(
  currentConfig: Config,
  keyPath: string,
  value: unknown,
): NormalizedConfigValue {
  const nextConfig = structuredClone(currentConfig);
  _.set(nextConfig, keyPath, value);

  const parsed = ConfigSchema.safeParse(nextConfig);
  if (!parsed.success) {
    const issue = parsed.error.issues.find((x) =>
      x.path.join(".").startsWith(keyPath)
    ) ?? parsed.error.issues[0];
    const issuePath = issue.path.length > 0 ? issue.path.join(".") : keyPath;
    return {
      ok: false,
      message: `Invalid value for "${keyPath}" (${issuePath}): ${issue.message}`,
    };
  }

  return {
    ok: true,
    value: _.get(parsed.data, keyPath),
  };
}
