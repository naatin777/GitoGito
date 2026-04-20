import { expect, test } from "bun:test";
import { type FlatSchemaItem } from "../../helpers/flat_schema.ts";
import {
  configUiReducer,
  initializeConfigTree,
  moveDown,
  selectConfigFilteredItems,
  selectConfigSelectedIndex,
  selectConfigSelectedPath,
  selectItem,
  toggleItem,
} from "./config_page_slice.ts";

const items: FlatSchemaItem[] = [
  { key: "ai", parents: [], description: undefined, isLeaf: false },
  { key: "model", parents: ["ai"], description: undefined, isLeaf: true },
  { key: "provider", parents: ["ai"], description: undefined, isLeaf: true },
  { key: "theme", parents: [], description: undefined, isLeaf: true },
];

test("initializeConfigTree selects the first visible item", () => {
  const state = configUiReducer(undefined, initializeConfigTree(items));

  expect(selectConfigSelectedPath.resultFunc(state)).toBe("ai");
});

test("toggleItem shows children only while the parent path is open", () => {
  const initialized = configUiReducer(undefined, initializeConfigTree(items));
  const opened = configUiReducer(initialized, toggleItem("ai"));
  const closed = configUiReducer(opened, toggleItem("ai"));

  expect(selectConfigFilteredItems.resultFunc(opened)).toEqual([
    items[0],
    items[1],
    items[2],
    items[3],
  ]);
  expect(selectConfigFilteredItems.resultFunc(closed)).toEqual([
    items[0],
    items[3],
  ]);
});

test("moveDown uses the visible item order", () => {
  let state = configUiReducer(undefined, initializeConfigTree(items));
  state = configUiReducer(state, toggleItem("ai"));
  state = configUiReducer(state, moveDown());
  state = configUiReducer(state, moveDown());

  const visibleItems = selectConfigFilteredItems.resultFunc(state);
  const expectedSelectedPath = selectConfigSelectedPath.resultFunc(state);
  const selectedIndex = selectConfigSelectedIndex.resultFunc(
    visibleItems,
    expectedSelectedPath,
  );

  expect(expectedSelectedPath).toBe("ai.provider");
  expect(selectedIndex).toBe(2);
});

test("closing a parent keeps selection on a visible item", () => {
  let state = configUiReducer(undefined, initializeConfigTree(items));
  state = configUiReducer(state, toggleItem("ai"));
  state = configUiReducer(state, selectItem("ai.model"));
  state = configUiReducer(state, toggleItem("ai"));

  expect(selectConfigSelectedPath.resultFunc(state)).toBe("ai");
});
