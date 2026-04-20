import _ from "lodash";
import { parse, parseDocument } from "yaml";
import type { NestedKeys, PathValue } from "../../type.ts";
import { envRepository as defaultEnvRepository, type EnvRepository } from "../env_repository.ts";
import {
  credentialFile as defaultCredentialFile,
  type CredentialFile,
  type CredentialsScope,
} from "./credential_file.ts";
import type { Credentials } from "./credentials_schema.ts";

export interface CredentialService {
  getGlobalCredentials(): Promise<Partial<Credentials>>;
  getLocalCredentials(): Promise<Partial<Credentials>>;
  getMergedCredentials(): Promise<Partial<Credentials>>;
  saveCredentials<K extends NestedKeys<Credentials>>(
    scope: CredentialsScope,
    key: K,
    value: PathValue<Credentials, K>,
  ): Promise<void>;
}

export class CredentialServiceImpl implements CredentialService {
  constructor(
    private envRepository: EnvRepository = defaultEnvRepository,
    private credentialFile: CredentialFile = defaultCredentialFile,
  ) { }

  async getGlobalCredentials(): Promise<Partial<Credentials>> {
    const text = await this.credentialFile.load("global");
    return (parse(text) ?? {}) as Partial<Credentials>;
  }

  async getLocalCredentials(): Promise<Partial<Credentials>> {
    const text = await this.credentialFile.load("local");
    return (parse(text) ?? {}) as Partial<Credentials>;
  }

  async getMergedCredentials(): Promise<Partial<Credentials>> {
    const global = await this.getGlobalCredentials();
    const local = await this.getLocalCredentials();
    const env = this.envRepository.getCredentials();
    return _.merge({}, global, local, env);
  }

  async saveCredentials<K extends NestedKeys<Credentials>>(
    scope: CredentialsScope,
    key: K,
    value: PathValue<Credentials, K>,
  ): Promise<void> {
    const text = await this.credentialFile.load(scope);
    const doc = parseDocument(text);
    doc.setIn((key as string).split("."), value);
    await this.credentialFile.save(scope, doc.toString());
  }
}

export const credentialService = new CredentialServiceImpl();
