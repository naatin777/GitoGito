import { configureStore } from "@reduxjs/toolkit";
import { commitReducer } from "../features/commit/commit_slice.ts";
import { issueReducer } from "../features/issue/issue_slice.ts";
import {
  type GitRemoteRepository,
  GitRemoteRepositoryCliImpl,
} from "../services/git/remote_repository.ts";

export interface AppExtraArgument {
  git: GitRemoteRepository;
}

export const store = configureStore({
  reducer: {
    commit: commitReducer,
    issue: issueReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: {
        extraArgument: {
          git: new GitRemoteRepositoryCliImpl(),
        } satisfies AppExtraArgument,
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
