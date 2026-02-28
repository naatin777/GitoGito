import {
  createSelector,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { FlatSchemaItem } from "../../helpers/flat_schema.ts";
import type { RootState } from "../../app/store.ts";

interface ConfigState {
  items: FlatSchemaItem[];
  everOpenedPaths: string[];
  closedPaths: string[];
  selectedIndex: number;
}

const initialState: ConfigState = {
  items: [],
  everOpenedPaths: [],
  closedPaths: [],
  selectedIndex: 0,
};

const pathFromItem = (item: FlatSchemaItem) =>
  [...item.parents, item.key].join(".");

const configSlice = createSlice({
  name: "config",
  initialState,
  reducers: {
    initializeConfigTree: (state, action: PayloadAction<FlatSchemaItem[]>) => {
      state.items = action.payload;
      state.everOpenedPaths = [];
      state.closedPaths = [];
      state.selectedIndex = 0;
    },
    toggleItem: (state, action: PayloadAction<number>) => {
      const filteredItems = selectFilteredItemsFromState(state);
      const item = filteredItems[action.payload];
      if (!item) return;

      const path = pathFromItem(item);
      const isCurrentlyOpen = state.everOpenedPaths.includes(path) &&
        !state.closedPaths.includes(path);

      if (isCurrentlyOpen) {
        if (!state.closedPaths.includes(path)) {
          state.closedPaths.push(path);
        }
        return;
      }

      state.closedPaths = state.closedPaths.filter((p) => p !== path);
      if (!state.everOpenedPaths.includes(path)) {
        state.everOpenedPaths.push(path);
      }
    },
    moveUp: (state) => {
      state.selectedIndex = Math.max(state.selectedIndex - 1, 0);
    },
    moveDown: (state) => {
      const filteredItems = selectFilteredItemsFromState(state);
      if (filteredItems.length === 0) {
        state.selectedIndex = 0;
        return;
      }
      state.selectedIndex = Math.min(
        filteredItems.length - 1,
        state.selectedIndex + 1,
      );
    },
  },
});

const selectConfigState = (state: RootState) => state.config;

const selectOpenPathsFromState = (state: ConfigState): string[] => {
  return state.everOpenedPaths.filter((path) => {
    if (state.closedPaths.includes(path)) return false;
    const parts = path.split(".");
    for (let i = 1; i < parts.length; i++) {
      const parentPath = parts.slice(0, i).join(".");
      if (state.closedPaths.includes(parentPath)) return false;
    }
    return true;
  });
};

const selectFilteredItemsFromState = (state: ConfigState): FlatSchemaItem[] => {
  const openPaths = selectOpenPathsFromState(state);
  return state.items.flatMap((item) => {
    const parentPath = item.parents.join(".");
    if (!parentPath) return [item];

    const path = `${parentPath}.${item.key}`;
    return openPaths.some((openPath) =>
        path.startsWith(openPath) &&
        openPath.split(".").length === item.parents.length
      )
      ? [item]
      : [];
  });
};

export const selectConfigSelectedIndex = createSelector(
  [selectConfigState],
  (state) => state.selectedIndex,
);

export const selectConfigOpenPaths = createSelector(
  [selectConfigState],
  (state) => new Set(selectOpenPathsFromState(state)),
);

export const selectConfigFilteredItems = createSelector(
  [selectConfigState],
  (state) => selectFilteredItemsFromState(state),
);

export const { initializeConfigTree, moveDown, moveUp, toggleItem } =
  configSlice.actions;
export const configReducer = configSlice.reducer;
