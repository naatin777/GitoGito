import type { AppDependencies } from "./store.ts";
import { createConfigFile } from "../services/config/config_file.ts";
import { createConfigService } from "../services/config/config_service.ts";
import { createCredentialFile } from "../services/credential/credential_file.ts";
import { createCredentialService } from "../services/credential/credential_service.ts";
import { createEnvRepository } from "../repositories/env/env_repository.ts";
import { GitRemoteRepositoryCliImpl } from "../repositories/git/remote_repository.ts";

export function createAppDependencies(
  overrides: Partial<AppDependencies> = {},
): AppDependencies {
  const env = overrides.env ?? createEnvRepository();
  const configFile = createConfigFile(env);
  const credentialFile = createCredentialFile(env);

  return {
    env,
    config: overrides.config ?? createConfigService(configFile),
    credentials: overrides.credentials ?? createCredentialService({ envRepository: env, credentialFile }),
    gitRemoteRepository: overrides.gitRemoteRepository ?? new GitRemoteRepositoryCliImpl(),
  };
}
