import { EnvError } from "../../lib/errors.ts";

export interface EnvService {
  getAiApiKey(): string | undefined;
  getGitHubToken(): string | undefined;
  getHome(): string;
}

export class EnvServiceImpl implements EnvService {
  getAiApiKey() {
    return Deno.env.get("DEMMITHUB_AI_API_KEY");
  }
  getGitHubToken() {
    return Deno.env.get("DEMMITHUB_GITHUB_TOKEN");
  }
  getHome() {
    const home = Deno.env.get("HOME") ?? Deno.env.get("USERPROFILE");
    if (!home) {
      throw new EnvError("HOME or USERPROFILE");
    }
    return home;
  }
}

export const envService = new EnvServiceImpl();
