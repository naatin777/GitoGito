import { parse } from "@std/yaml";
import type { EnvService } from "./env.ts";
import type { ConfigFile } from "./file.ts";
import {
  type AppContext,
  type Config,
  ConfigSchema,
  type Credentials,
} from "./schema.ts";

export class ConfigService {
  constructor(
    private envService: EnvService = envService,
    private configFile: ConfigFile = configFile,
  ) {}

  async getGlobalConfig(): Promise<{
    config: Partial<Config> | undefined;
    credentials: Partial<Credentials> | undefined;
  }> {
    const globalConfigText = await this.configFile.load("global");
    const { credentials, ...globalConfig } = parse(
      globalConfigText,
    ) as Partial<AppContext>;
    return { config: globalConfig, credentials: credentials };
  }

  async getProjectConfig(): Promise<Partial<Config> | undefined> {
    const projectConfigText = await this.configFile.load("project");
    const projectConfig = parse(
      projectConfigText,
    ) as Partial<Config>;
    return projectConfig;
  }

  async getLocalConfig(): Promise<{
    config: Partial<Config> | undefined;
    credentials: Partial<Credentials> | undefined;
  }> {
    const localConfigText = await this.configFile.load("local");
    const { credentials, ...localConfig } = parse(
      localConfigText,
    ) as Partial<AppContext>;
    return { config: localConfig, credentials: credentials };
  }

  async getMergedConfig(): Promise<Config> {
    const defaultConfig = ConfigSchema.parse({});
    const { config: globalConfig } = await this.getGlobalConfig();
    const projectConfig = await this.getProjectConfig();
    const { config: localConfig } = await this.getLocalConfig();
    return {
      ...defaultConfig,
      ...globalConfig,
      ...projectConfig,
      ...localConfig,
    };
  }

  async getMergedCredentials(): Promise<Partial<Credentials>> {
    const { credentials: globalCredentials } = await this.getGlobalConfig();
    const { credentials: localCredentials } = await this.getLocalConfig();
    const aiApiKey = this.envService.getAiApiKey();
    const githubToken = this.envService.getGitHubToken();
    const envCredentials: Partial<Credentials> = {
      aiApiKey: aiApiKey,
      githubToken: githubToken,
    };
    return {
      ...globalCredentials,
      ...localCredentials,
      ...envCredentials,
    };
  }
}
