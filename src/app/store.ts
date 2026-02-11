import { configureStore } from "@reduxjs/toolkit";
import { configApi } from "../api/config.ts";
import { commitReducer } from "../features/commit/commit_slice.ts";
import { configReducer } from "../features/config/config_slice.ts";
import { issueReducer } from "../features/issue/issue_slice.ts";
import {
  type ConfigService,
  ConfigServiceImpl,
} from "../services/config/config_service.ts";
import {
  type GitRemoteRepository,
  GitRemoteRepositoryCliImpl,
} from "../services/git/remote_repository.ts";

export interface AppExtraArgument {
  config: ConfigService;
  git: GitRemoteRepository;
}

export const store = configureStore({
  reducer: {
    commit: commitReducer,
    config: configReducer,
    issue: issueReducer,
    [configApi.reducerPath]: configApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: {
        extraArgument: {
          git: new GitRemoteRepositoryCliImpl(),
          config: new ConfigServiceImpl(),
        } satisfies AppExtraArgument,
      },
    }).concat(configApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
