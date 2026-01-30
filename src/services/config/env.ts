import { EnvError } from "../../lib/errors.ts";

type EnvKey =
  | "DEMMITHUB_AI_API_KEY"
  | "DEMMITHUB_GITHUB_TOKEN"
  | "HOME"
  | "USERPROFILE";

function getEnv(key: EnvKey): string {
  const value = Deno.env.get(key);
  if (!value) throw new EnvError(key);
  return value;
}

export interface EnvService {
  getAiApiKey(): string;
  getGitHubToken(): string;
  getHome(): string;
}

export class EnvServiceImpl implements EnvService {
  getAiApiKey() {
    return getEnv("DEMMITHUB_AI_API_KEY");
  }
  getGitHubToken() {
    return getEnv("DEMMITHUB_GITHUB_TOKEN");
  }
  getHome() {
    try {
      return getEnv("HOME");
    } catch {
      return getEnv("USERPROFILE");
    }
  }
}

export const envService = new EnvServiceImpl();
