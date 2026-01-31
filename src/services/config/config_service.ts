import { parse, stringify } from "@std/yaml";
import { set } from "lodash";
import type { NestedKeys, PathValue } from "../../type.ts";
import type { ConfigScope, CredentialsScope } from "../config/file.ts";
import type { EnvService } from "./env.ts";
import type { ConfigFile } from "./file.ts";
import type { AppContext } from "./schema/app_context.ts";
import { type Config, ConfigSchema } from "./schema/config.ts";
import type { Credentials } from "./schema/credentials.ts";

export interface ConfigService {
  getGlobalConfig(): Promise<{
    config: Partial<Config> | undefined;
    credentials: Partial<Credentials> | undefined;
  }>;

  getProjectConfig(): Promise<Partial<Config> | undefined>;

  getLocalConfig(): Promise<{
    config: Partial<Config> | undefined;
    credentials: Partial<Credentials> | undefined;
  }>;

  getMergedConfig(scope: ConfigScope): Promise<Partial<Config> | undefined>;

  saveConfig<K extends NestedKeys<Config>>(
    configScope: ConfigScope,
    key: K,
    value: PathValue<Config, K>,
  ): Promise<void>;

  saveCredentials<K extends NestedKeys<Credentials>>(
    credentialsScope: CredentialsScope,
    key: K,
    value: PathValue<Credentials, K>,
  ): Promise<void>;
}

export class ConfigServiceImpl implements ConfigService {
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

  async saveConfig<K extends NestedKeys<Config>>(
    configScope: ConfigScope,
    key: K,
    value: PathValue<Config, K>,
  ) {
    const configText = await this.configFile.load(configScope);
    const config = parse(configText) as Partial<Config>;
    set(config, key, value);
    await this.configFile.save(configScope, stringify(config));
  }

  async saveCredentials<K extends NestedKeys<Credentials>>(
    credentialsScope: CredentialsScope,
    key: K,
    value: PathValue<Credentials, K>,
  ) {
    const credentialsText = await this.configFile.load(credentialsScope);
    const credentials = parse(credentialsText) as Partial<Credentials>;
    set(credentials, key, value);
    await this.configFile.save(credentialsScope, stringify(credentials));
  }
}
