import _ from "lodash";
import { EnvError } from "../../lib/errors.ts";
import type { Credentials } from "../../services/credential/credentials_schema.ts";

export const ENV_KEYS = {
  OPEN_ROUTER_API_KEY: { key: "GITOGITO_OPEN_ROUTER_API_KEY", description: "API key for OpenRouter." },
  GEMINI_API_KEY: { key: "GITOGITO_GEMINI_API_KEY", description: "API key for Google Gemini." },
  GITHUB_TOKEN: { key: "GITOGITO_GITHUB_TOKEN", description: "GitHub personal access token." },
  NO_COLOR: { key: "NO_COLOR", description: "Disable color output when set (any value)." },
} as const;

export interface EnvRepository {
  getCredentials(): Partial<Credentials>;
  getNoColor(): boolean;
  getHome(): string;
}

export class EnvRepositoryProcessImpl implements EnvRepository {
  getCredentials(): Partial<Credentials> {
    return _.omitBy({
      openRouterApiKey: process.env[ENV_KEYS.OPEN_ROUTER_API_KEY.key],
      geminiApiKey: process.env[ENV_KEYS.GEMINI_API_KEY.key],
      githubToken: process.env[ENV_KEYS.GITHUB_TOKEN.key],
    }, _.isUndefined) as Partial<Credentials>;
  }
  getNoColor(): boolean {
    return process.env[ENV_KEYS.NO_COLOR.key] !== undefined;
  }
  getHome(): string {
    const home = process.env.HOME ?? process.env.USERPROFILE;
    if (!home) {
      throw new EnvError("HOME or USERPROFILE");
    }
    return home;
  }
}

export function createEnvRepository(): EnvRepository {
  return new EnvRepositoryProcessImpl();
}
