import { configureStore } from "@reduxjs/toolkit";
import { commitReducer } from "./slices/commitSlice.ts";
import { issueReducer } from "./slices/issueSlice.ts";
import { editCommitMessageReducer } from "./slices/editCommitMessageSlice.ts";

export const store = configureStore({
  reducer: {
    commit: commitReducer,
    issue: issueReducer,
    editCommitMessage: editCommitMessageReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these paths in state for non-serializable values if needed
        ignoredActions: [],
        ignoredPaths: [],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
