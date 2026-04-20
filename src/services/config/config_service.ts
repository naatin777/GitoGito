import _ from "lodash";
import { parse, parseDocument } from "yaml";
import type { NestedKeys, PathValue } from "../../type.ts";
import { createConfigFile, type ConfigFile, type ConfigScope } from "./config_file.ts";
import { type Config, DEFAULT_CONFIG } from "./schema/config_schema.ts";
import { GlobalConfigSchema, type GlobalConfig } from "./schema/global_config_schema.ts";
import { LocalConfigSchema, type LocalConfig } from "./schema/local_config_schema.ts";
import { ProjectConfigSchema, type ProjectConfig } from "./schema/project_config_schema.ts";

export interface ConfigService {
  getGlobalConfig(): Promise<Partial<GlobalConfig>>;
  getProjectConfig(): Promise<Partial<ProjectConfig>>;
  getLocalConfig(): Promise<Partial<LocalConfig>>;
  getMergedConfig(): Promise<Config>;

  saveConfig<K extends NestedKeys<Config>>(
    configScope: ConfigScope,
    key: K,
    value: PathValue<Config, K>,
  ): Promise<void>;
}

const GLOBAL_KEYS = Object.keys(GlobalConfigSchema.shape) as (keyof GlobalConfig)[];
const PROJECT_KEYS = Object.keys(ProjectConfigSchema.shape) as (keyof ProjectConfig)[];
const LOCAL_KEYS = Object.keys(LocalConfigSchema.shape) as (keyof LocalConfig)[];

export class ConfigServiceImpl implements ConfigService {
  constructor(private configFile: ConfigFile) {}

  async getGlobalConfig(): Promise<Partial<GlobalConfig>> {
    const text = await this.configFile.load("global");
    const raw = (parse(text) ?? {}) as Record<string, unknown>;
    return _.pick(raw, GLOBAL_KEYS) as Partial<GlobalConfig>;
  }

  async getProjectConfig(): Promise<Partial<ProjectConfig>> {
    const text = await this.configFile.load("project");
    const raw = (parse(text) ?? {}) as Record<string, unknown>;
    return _.pick(raw, PROJECT_KEYS) as Partial<ProjectConfig>;
  }

  async getLocalConfig(): Promise<Partial<LocalConfig>> {
    const text = await this.configFile.load("local");
    const raw = (parse(text) ?? {}) as Record<string, unknown>;
    return _.pick(raw, LOCAL_KEYS) as Partial<LocalConfig>;
  }

  async getMergedConfig(): Promise<Config> {
    const global = await this.getGlobalConfig();
    const project = await this.getProjectConfig();
    const local = await this.getLocalConfig();
    return _.merge({}, DEFAULT_CONFIG, global, project, local);
  }

  async saveConfig<K extends NestedKeys<Config>>(
    configScope: ConfigScope,
    key: K,
    value: PathValue<Config, K>,
  ): Promise<void> {
    const text = await this.configFile.load(configScope);
    const doc = parseDocument(text);
    doc.setIn((key as string).split("."), value);
    await this.configFile.save(configScope, doc.toString());
  }
}

export function createConfigService(configFile: ConfigFile = createConfigFile()): ConfigService {
  return new ConfigServiceImpl(configFile);
}
