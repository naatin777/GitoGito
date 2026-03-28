import { expect, test } from "bun:test";
import {
  getSelectPositionLabel,
  SELECT_EMPTY_MESSAGE,
} from "./Select.tsx";

test("getSelectPositionLabel uses zero when there are no choices", () => {
  expect(getSelectPositionLabel(0, 0)).toBe("(0/0)");
});

test("getSelectPositionLabel uses one-based positions", () => {
  expect(getSelectPositionLabel(1, 3)).toBe("(2/3)");
});

test("SELECT_EMPTY_MESSAGE explains how to exit empty selection", () => {
  expect(SELECT_EMPTY_MESSAGE).toContain("No options available");
  expect(SELECT_EMPTY_MESSAGE).toContain("Enter or Esc");
});
