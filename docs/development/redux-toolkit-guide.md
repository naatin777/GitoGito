# Redux Toolkit Development Guide

## 1. Project Principles

- Use **Redux Toolkit (RTK)** following 2026 best practices.
- **TypeScript** is mandatory with strict type definitions for stores, states,
  actions, and API responses.
- Adopt **Feature Folder Structure** to consolidate logic by functionality.

## 2. Recommended Directory Structure

Organize files according to the following structure:

```
src/
  ├── app/                # Global application configuration
  │    ├── store.ts       # configureStore setup (including RTK Query middleware)
  │    └── hooks.ts       # Export typed useDispatch and useSelector
  ├── services/           # API communication layer (RTK Query)
  │    └── api.ts         # baseQuery and common API definitions
  ├── features/           # Feature (domain) based folders
  │    └── [featureName]/
  │         ├── [featureName]Slice.ts  # Local/UI state management (createSlice)
  │         ├── [featureName]Api.ts    # API definition extensions (injectEndpoints)
  │         ├── [featureName]Selectors.ts # Complex data extraction (createSelector)
  │         └── components/            # React components related to this feature
  └── types/              # Cross-project common type definitions
```

## 3. Implementation Rules

### 3.1 API Communication

- **Prefer RTK Query (`createApi`)** over `createAsyncThunk` for server
  communication.
- Define API endpoints using `createApi` and extend with `injectEndpoints` per
  feature.
- Leverage automatic cache management, loading states, and refetching.

**Example:**

```typescript
// services/api.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  endpoints: () => ({}),
});
```

```typescript
// features/user/userApi.ts
import { baseApi } from "../../services/api.ts";

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUser: builder.query<User, string>({
      query: (id) => `users/${id}`,
    }),
    updateUser: builder.mutation<User, UpdateUserRequest>({
      query: ({ id, ...patch }) => ({
        url: `users/${id}`,
        method: "PATCH",
        body: patch,
      }),
    }),
  }),
});

export const { useGetUserQuery, useUpdateUserMutation } = userApi;
```

### 3.2 Slice Design

- Use `createSlice` **only for client-side state** that should be managed
  locally:
  - UI state (modals, tabs, form inputs)
  - Temporary data not persisted to server
  - Application-wide settings (theme, language)

- **Do not** use slices for server data that can be fetched via RTK Query.

**Example:**

```typescript
// features/theme/themeSlice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type ThemeState = {
  mode: "light" | "dark";
  sidebarOpen: boolean;
};

const initialState: ThemeState = {
  mode: "light",
  sidebarOpen: true,
};

export const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.mode = state.mode === "light" ? "dark" : "light";
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setTheme: (state, action: PayloadAction<"light" | "dark">) => {
      state.mode = action.payload;
    },
  },
});

export const { toggleTheme, toggleSidebar, setTheme } = themeSlice.actions;
export const themeReducer = themeSlice.reducer;
```

### 3.3 Type Safety

- Define typed hooks in `app/hooks.ts` and use them in components.
- **Never use** plain `useDispatch` or `useSelector` directly.

**Example:**

```typescript
// app/hooks.ts
import {
  type TypedUseSelectorHook,
  useDispatch,
  useSelector,
} from "react-redux";
import type { AppDispatch, RootState } from "./store.ts";

// Use throughout app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

**Usage in components:**

```typescript
import { useAppDispatch, useAppSelector } from "../../app/hooks.ts";
import { toggleTheme } from "../theme/themeSlice.ts";

export function ThemeToggle() {
  const dispatch = useAppDispatch();
  const mode = useAppSelector((state) => state.theme.mode);

  return (
    <button onClick={() => dispatch(toggleTheme())}>
      Current: {mode}
    </button>
  );
}
```

### 3.4 Data Extraction with Selectors

- Use `createSelector` from Reselect (included in RTK) for complex data
  extraction.
- Memoization prevents unnecessary re-renders when derived data hasn't changed.
- Place selectors in `[featureName]Selectors.ts` files.

**Example:**

```typescript
// features/commit/commitSelectors.ts
import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "../../app/store.ts";

// Input selectors
const selectCommitHeader = (state: RootState) => state.editCommitMessage.header;

const selectCommitForm = (state: RootState) => state.editCommitMessage.form;

// Memoized selector
export const selectDecoratedFullText = createSelector(
  [selectCommitHeader],
  (header) => {
    if (!header.decorated) return header.value;
    return header.decorated.fullText;
  },
);

// Selector with multiple inputs
export const selectIsEditable = createSelector(
  [selectCommitForm, selectCommitHeader],
  (form, header) => {
    return form.focus === "header" && form.mode === "normal";
  },
);

// Parameterized selector factory
export const makeSelectCursorInRange = () =>
  createSelector(
    [
      selectCommitHeader,
      (_state: RootState, start: number) => start,
      (_state: RootState, _start: number, end: number) => end,
    ],
    (header, start, end) => {
      return header.cursor >= start && header.cursor <= end;
    },
  );
```

**Usage:**

```typescript
import { useAppSelector } from "../../app/hooks.ts";
import {
  selectDecoratedFullText,
  selectIsEditable,
} from "../commit/commitSelectors.ts";

export function CommitHeader() {
  const fullText = useAppSelector(selectDecoratedFullText);
  const isEditable = useAppSelector(selectIsEditable);

  return <div>{fullText}</div>;
}
```

## 4. Store Configuration

### 4.1 Configure Store

```typescript
// app/store.ts
import { configureStore } from "@reduxjs/toolkit";
import { baseApi } from "../services/api.ts";
import { themeReducer } from "../features/theme/themeSlice.ts";
import { editCommitMessageReducer } from "../features/commit/editCommitMessageSlice.ts";

export const store = configureStore({
  reducer: {
    // RTK Query API slice
    [baseApi.reducerPath]: baseApi.reducer,

    // Feature slices
    theme: themeReducer,
    editCommitMessage: editCommitMessageReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});

// Infer types from store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### 4.2 Provider Setup

```typescript
// main.tsx
import { Provider } from "react-redux";
import { store } from "./app/store.ts";

function App() {
  return (
    <Provider store={store}>
      <YourApp />
    </Provider>
  );
}
```

## 5. Feature Folder Structure Example

```
features/
  └── commit/
       ├── editCommitMessageSlice.ts    # UI state (cursor, focus, etc.)
       ├── commitApi.ts                  # API endpoints (if needed)
       ├── commitSelectors.ts            # Memoized selectors
       ├── commitTypes.ts                # Feature-specific types
       ├── domain/                       # Business logic
       │    ├── commit-decorator.ts
       │    └── commit-header-completion.ts
       └── components/                   # UI components
            ├── Header.tsx
            ├── Body.tsx
            └── Footer.tsx
```

## 6. Best Practices

### 6.1 Keep Slices Minimal

❌ **Bad:** Storing server data in slices

```typescript
const userSlice = createSlice({
  name: "user",
  initialState: { data: null, loading: false, error: null },
  reducers: {
    fetchUserStart: (state) => {
      state.loading = true;
    },
    fetchUserSuccess: (state, action) => {
      state.data = action.payload;
    },
    fetchUserError: (state, action) => {
      state.error = action.payload;
    },
  },
});
```

✅ **Good:** Use RTK Query

```typescript
export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUser: builder.query<User, string>({
      query: (id) => `users/${id}`,
    }),
  }),
});
```

### 6.2 Normalize State Shape

For complex nested data, use normalized state:

```typescript
type NormalizedState<T> = {
  ids: string[];
  entities: Record<string, T>;
};
```

Or use `@reduxjs/toolkit`'s `createEntityAdapter`:

```typescript
import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";

const commitsAdapter = createEntityAdapter<Commit>({
  selectId: (commit) => commit.id,
  sortComparer: (a, b) => b.timestamp - a.timestamp,
});

const commitsSlice = createSlice({
  name: "commits",
  initialState: commitsAdapter.getInitialState(),
  reducers: {
    commitAdded: commitsAdapter.addOne,
    commitUpdated: commitsAdapter.updateOne,
    commitRemoved: commitsAdapter.removeOne,
  },
});

export const {
  selectAll: selectAllCommits,
  selectById: selectCommitById,
  selectIds: selectCommitIds,
} = commitsAdapter.getSelectors((state: RootState) => state.commits);
```

### 6.3 Handle Loading and Error States

With RTK Query, loading and error states are automatic:

```typescript
function UserProfile({ userId }: { userId: string }) {
  const { data: user, isLoading, isError, error } = useGetUserQuery(userId);

  if (isLoading) return <Spinner />;
  if (isError) return <Error message={error.message} />;
  if (!user) return <NotFound />;

  return <div>{user.name}</div>;
}
```

### 6.4 Optimistic Updates

```typescript
export const postApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    updatePost: builder.mutation<Post, { id: string; title: string }>({
      query: ({ id, title }) => ({
        url: `posts/${id}`,
        method: "PATCH",
        body: { title },
      }),
      // Optimistic update
      onQueryStarted: async ({ id, title }, { dispatch, queryFulfilled }) => {
        const patchResult = dispatch(
          postApi.util.updateQueryData("getPost", id, (draft) => {
            draft.title = title;
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
  }),
});
```

### 6.5 Code Splitting

Lazy-load slices and API endpoints for better performance:

```typescript
// Dynamically inject endpoints
const enhancedApi = baseApi.enhanceEndpoints({
  addTagTypes: ["Post"],
  endpoints: {
    getPost: {
      providesTags: (result, error, id) => [{ type: "Post", id }],
    },
  },
});
```

## 7. Testing

### 7.1 Test Slices

```typescript
import { configureStore } from "@reduxjs/toolkit";
import { themeSlice, toggleTheme } from "./themeSlice.ts";

describe("themeSlice", () => {
  test("toggles theme mode", () => {
    const store = configureStore({
      reducer: { theme: themeSlice.reducer },
    });

    expect(store.getState().theme.mode).toBe("light");

    store.dispatch(toggleTheme());

    expect(store.getState().theme.mode).toBe("dark");
  });
});
```

### 7.2 Test Selectors

```typescript
import { selectDecoratedFullText } from "./commitSelectors.ts";

describe("commitSelectors", () => {
  test("returns full text when decorated", () => {
    const state = {
      editCommitMessage: {
        header: {
          value: "fix: bug",
          decorated: {
            fullText: "WIP: fix: bug",
            prefixes: ["WIP: "],
            userText: "fix: bug",
            suffixes: [],
          },
        },
      },
    } as RootState;

    expect(selectDecoratedFullText(state)).toBe("WIP: fix: bug");
  });
});
```

### 7.3 Test RTK Query

```typescript
import { setupApiStore } from "@reduxjs/toolkit/query/react";
import { userApi } from "./userApi.ts";

describe("userApi", () => {
  const store = setupApiStore(userApi);

  test("fetches user successfully", async () => {
    const result = await store.dispatch(
      userApi.endpoints.getUser.initiate("123"),
    );

    expect(result.data).toEqual({ id: "123", name: "John" });
  });
});
```

## 8. Migration from Legacy Redux

### 8.1 From createStore to configureStore

❌ **Old:**

```typescript
import { combineReducers, createStore } from "redux";

const rootReducer = combineReducers({ user: userReducer });
const store = createStore(rootReducer);
```

✅ **New:**

```typescript
import { configureStore } from "@reduxjs/toolkit";

const store = configureStore({
  reducer: { user: userReducer },
});
```

### 8.2 From Action Creators to createSlice

❌ **Old:**

```typescript
// Action types
const INCREMENT = "INCREMENT";

// Action creators
const increment = () => ({ type: INCREMENT });

// Reducer
function counterReducer(state = 0, action) {
  switch (action.type) {
    case INCREMENT:
      return state + 1;
    default:
      return state;
  }
}
```

✅ **New:**

```typescript
import { createSlice } from "@reduxjs/toolkit";

const counterSlice = createSlice({
  name: "counter",
  initialState: 0,
  reducers: {
    increment: (state) => state + 1,
  },
});

export const { increment } = counterSlice.actions;
export const counterReducer = counterSlice.reducer;
```

## 9. Performance Optimization

### 9.1 Use Reselect for Expensive Computations

```typescript
import { createSelector } from "@reduxjs/toolkit";

// This selector will only recompute when todos change
export const selectCompletedTodos = createSelector(
  [(state: RootState) => state.todos.items],
  (items) => items.filter((todo) => todo.completed),
);
```

### 9.2 Avoid Creating New Objects in Selectors

❌ **Bad:** Creates new array on every call

```typescript
const selectUsers = (state) => state.users.filter((u) => u.active);
```

✅ **Good:** Memoized with createSelector

```typescript
const selectActiveUsers = createSelector(
  [(state) => state.users],
  (users) => users.filter((u) => u.active),
);
```

### 9.3 Use Batch Updates

```typescript
import { batch } from "react-redux";

batch(() => {
  dispatch(action1());
  dispatch(action2());
  dispatch(action3());
});
```

## 10. Common Patterns

### 10.1 Feature Flags

```typescript
const featuresSlice = createSlice({
  name: "features",
  initialState: {
    decorators: true,
    aiMode: false,
    experimentalUI: false,
  },
  reducers: {
    toggleFeature: (state, action: PayloadAction<keyof typeof state>) => {
      const feature = action.payload;
      state[feature] = !state[feature];
    },
  },
});
```

### 10.2 Undo/Redo

```typescript
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type HistoryState<T> = {
  past: T[];
  present: T;
  future: T[];
};

function createUndoableSlice<T>(name: string, initialState: T) {
  return createSlice({
    name,
    initialState: {
      past: [],
      present: initialState,
      future: [],
    } as HistoryState<T>,
    reducers: {
      update: (state, action: PayloadAction<T>) => {
        state.past.push(state.present);
        state.present = action.payload;
        state.future = [];
      },
      undo: (state) => {
        if (state.past.length === 0) return;
        const previous = state.past.pop()!;
        state.future.unshift(state.present);
        state.present = previous;
      },
      redo: (state) => {
        if (state.future.length === 0) return;
        const next = state.future.shift()!;
        state.past.push(state.present);
        state.present = next;
      },
    },
  });
}
```

## References

- [Redux Toolkit Official Documentation](https://redux-toolkit.js.org/)
- [RTK Query Documentation](https://redux-toolkit.js.org/rtk-query/overview)
- [Redux Style Guide](https://redux.js.org/style-guide/)
- [Reselect Documentation](https://github.com/reduxjs/reselect)
