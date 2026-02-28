import { EnvError } from "../../lib/errors.ts";

export interface EnvService {
  getAiApiKey(): string | undefined;
  getGitHubToken(): string | undefined;
  getHome(): string;
}

export class EnvServiceImpl implements EnvService {
  getAiApiKey() {
    return process.env.GITOGITO_AI_API_KEY;
  }
  getGitHubToken() {
    return process.env.GITOGITO_GITHUB_TOKEN;
  }
  getHome() {
    const home = process.env.HOME ?? process.env.USERPROFILE;
    if (!home) {
      throw new EnvError("HOME or USERPROFILE");
    }
    return home;
  }
}

export const envService = new EnvServiceImpl();
