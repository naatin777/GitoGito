import {
  createSelector,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { RootState } from "../../app/store.ts";
import { fullPath, type FlatSchemaItem } from "../../helpers/flat_schema.ts";

interface ConfigState {
  items: FlatSchemaItem[];
  openPaths: string[];
  selectedPath: string | null;
}

const initialState: ConfigState = {
  items: [],
  openPaths: [],
  selectedPath: null,
};

const isVisible = (item: FlatSchemaItem, openPaths: string[]) =>
  item.parents.every((_, i) =>
    openPaths.includes(item.parents.slice(0, i + 1).join("."))
  );

const visibleItems = (state: ConfigState) =>
  state.items.filter((item) => isVisible(item, state.openPaths));

const clampSelection = (state: ConfigState) => {
  const items = visibleItems(state);
  if (items.length === 0) { state.selectedPath = null; return; }
  if (!items.some((item) => fullPath(item) === state.selectedPath)) {
    state.selectedPath = items[0] ? fullPath(items[0]) : null;
  }
};

const configUiSlice = createSlice({
  name: "config",
  initialState,
  reducers: {
    initializeConfigTree: (state, action: PayloadAction<FlatSchemaItem[]>) => {
      state.items = action.payload;
      state.openPaths = [];
      state.selectedPath = action.payload[0] ? fullPath(action.payload[0]) : null;
    },
    toggleItem: (state, action: PayloadAction<string>) => {
      const path = action.payload;
      const item = state.items.find((c) => fullPath(c) === path);
      if (!item || item.isLeaf) return;

      if (state.openPaths.includes(path)) {
        state.openPaths = state.openPaths.filter(
          (p) => p !== path && !p.startsWith(`${path}.`)
        );
      } else {
        state.openPaths.push(path);
      }
      clampSelection(state);
    },
    moveUp: (state) => {
      const items = visibleItems(state);
      const i = items.findIndex((item) => fullPath(item) === state.selectedPath);
      if (i > 0) state.selectedPath = fullPath(items[i - 1]);
    },
    moveDown: (state) => {
      const items = visibleItems(state);
      const i = items.findIndex((item) => fullPath(item) === state.selectedPath);
      if (i >= 0 && i < items.length - 1) state.selectedPath = fullPath(items[i + 1]);
    },
    selectItem: (state, action: PayloadAction<string>) => {
      state.selectedPath = action.payload;
    },
  },
});

const selectConfigState = (state: RootState) => state.configUi;

export const selectConfigFilteredItems = createSelector(
  [selectConfigState],
  visibleItems,
);

export const selectConfigOpenPaths = createSelector(
  [selectConfigState],
  (state) => new Set(state.openPaths),
);

export const selectConfigSelectedPath = createSelector(
  [selectConfigState],
  (state) => state.selectedPath,
);

export const selectConfigSelectedIndex = createSelector(
  [selectConfigFilteredItems, selectConfigSelectedPath],
  (items, path) => Math.max(0, items.findIndex((item) => fullPath(item) === path)),
);

export const selectConfigSelectedItem = createSelector(
  [selectConfigFilteredItems, selectConfigSelectedIndex],
  (items, i) => items[i] ?? null,
);

export const {
  initializeConfigTree,
  moveDown,
  moveUp,
  selectItem,
  toggleItem,
} = configUiSlice.actions;
export const configUiReducer = configUiSlice.reducer;
