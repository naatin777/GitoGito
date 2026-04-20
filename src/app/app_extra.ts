import type { AppDependencies } from "./store.ts";
import { ConfigServiceImpl } from "../services/config/config_service.ts";
import { CredentialServiceImpl } from "../services/credential/credential_service.ts";
import { GitRemoteRepositoryCliImpl } from "../services/git/remote_repository.ts";

export function createAppDependencies(
  overrides: Partial<AppDependencies> = {},
): AppDependencies {
  return {
    config: overrides.config ?? new ConfigServiceImpl(),
    credentials: overrides.credentials ?? new CredentialServiceImpl(),
    gitRemoteRepository: overrides.gitRemoteRepository ?? new GitRemoteRepositoryCliImpl(),
  };
}
