import { configureStore } from "@reduxjs/toolkit";
import { commitReducer } from "../features/commit/commit_slice.ts";
import { configUiReducer } from "../features/config/config_page_slice.ts";
import { configReducer } from "../features/config/config_slice.ts";
import { issueReducer } from "../features/issue/issue_slice.ts";
import { notificationsReducer } from "../features/notifications/notifications_slice.ts";
import {
  type ConfigService,
  ConfigServiceImpl,
} from "../services/config/config_service.ts";
import { ConfigSchema } from "../services/config/schema/config_schema.ts";
import type { GlobalConfig } from "../services/config/schema/global_config_schema.ts";
import type { LocalConfig } from "../services/config/schema/local_config_schema.ts";
import type { ProjectConfig } from "../services/config/schema/project_config_schema.ts";
import {
  type CredentialService,
  CredentialServiceImpl,
} from "../services/credential/credential_service.ts";
import {
  type GitRemoteRepository,
  GitRemoteRepositoryCliImpl,
} from "../services/git/remote_repository.ts";

export interface AppDependencies {
  config: ConfigService;
  credentials: CredentialService;
  gitRemoteRepository: GitRemoteRepository;
}

const reducer = {
  commit: commitReducer,
  config: configReducer,
  issue: issueReducer,
  configUi: configUiReducer,
  notifications: notificationsReducer,
};

export function createAppStore({
  config: {
    mergedConfig = ConfigSchema.parse({}),
    localConfig = {} as Partial<LocalConfig>,
    globalConfig = {} as Partial<GlobalConfig>,
    projectConfig = {} as Partial<ProjectConfig>,
  } = {},
  dependencies = {
    gitRemoteRepository: new GitRemoteRepositoryCliImpl(),
    config: new ConfigServiceImpl(),
    credentials: new CredentialServiceImpl(),
  }
}: {
  config?: {
    mergedConfig?: ReturnType<typeof ConfigSchema.parse>;
    localConfig?: Partial<LocalConfig>;
    globalConfig?: Partial<GlobalConfig>;
    projectConfig?: Partial<ProjectConfig>;
  };
  dependencies?: AppDependencies;
} = {}) {
  return configureStore({
    reducer,
    preloadedState: {
      config: { mergedConfig, localConfig, globalConfig, projectConfig }
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        thunk: {
          extraArgument: dependencies,
        },
      }),
  });
}

export type AppStore = ReturnType<typeof createAppStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
