import { expect, test } from "bun:test";
import { add } from "./main";

test("2 + 2", () => {
  expect(add(2, 2)).toBe(4);
});
