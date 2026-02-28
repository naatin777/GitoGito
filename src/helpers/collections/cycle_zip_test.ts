import { expect, test } from "bun:test";

const assertEquals = (actual: unknown, expected: unknown) => {
  expect(actual).toEqual(expected);
};
import { cycleZip } from "./cycle_zip.ts";

test("cycleZip - same length arrays", () => {
  const arr1 = [1, 2, 3];
  const arr2 = ["a", "b", "c"];
  const result = cycleZip(arr1, arr2);

  assertEquals(result, [
    [1, "a"],
    [2, "b"],
    [3, "c"],
  ]);
});

test("cycleZip - different length arrays (2 and 3)", () => {
  const arr1 = [1, 2];
  const arr2 = ["a", "b", "c"];
  const result = cycleZip(arr1, arr2);

  // LCM(2, 3) = 6
  assertEquals(result, [
    [1, "a"],
    [2, "b"],
    [1, "c"],
    [2, "a"],
    [1, "b"],
    [2, "c"],
  ]);
});

test("cycleZip - different length arrays (3 and 4)", () => {
  const arr1 = [1, 2, 3];
  const arr2 = ["a", "b", "c", "d"];
  const result = cycleZip(arr1, arr2);

  // LCM(3, 4) = 12
  assertEquals(result.length, 12);
  assertEquals(result, [
    [1, "a"],
    [2, "b"],
    [3, "c"],
    [1, "d"],
    [2, "a"],
    [3, "b"],
    [1, "c"],
    [2, "d"],
    [3, "a"],
    [1, "b"],
    [2, "c"],
    [3, "d"],
  ]);
});

test("cycleZip - arrays with common divisor (4 and 6)", () => {
  const arr1 = [1, 2, 3, 4];
  const arr2 = ["a", "b", "c", "d", "e", "f"];
  const result = cycleZip(arr1, arr2);

  // LCM(4, 6) = 12
  assertEquals(result.length, 12);
  assertEquals(result[0], [1, "a"]);
  assertEquals(result[11], [4, "f"]);
});

test("cycleZip - first array is empty", () => {
  const arr1: number[] = [];
  const arr2 = ["a", "b", "c"];
  const result = cycleZip(arr1, arr2);

  assertEquals(result, []);
});

test("cycleZip - second array is empty", () => {
  const arr1 = [1, 2, 3];
  const arr2: string[] = [];
  const result = cycleZip(arr1, arr2);

  assertEquals(result, []);
});

test("cycleZip - both arrays are empty", () => {
  const arr1: number[] = [];
  const arr2: string[] = [];
  const result = cycleZip(arr1, arr2);

  assertEquals(result, []);
});

test("cycleZip - single element arrays", () => {
  const arr1 = [42];
  const arr2 = ["x"];
  const result = cycleZip(arr1, arr2);

  assertEquals(result, [[42, "x"]]);
});

test("cycleZip - one array has length 1", () => {
  const arr1 = [1];
  const arr2 = ["a", "b", "c"];
  const result = cycleZip(arr1, arr2);

  // LCM(1, 3) = 3
  assertEquals(result, [
    [1, "a"],
    [1, "b"],
    [1, "c"],
  ]);
});

test("cycleZip - works with different types", () => {
  const arr1 = [true, false];
  const arr2 = [10, 20, 30];
  const result = cycleZip(arr1, arr2);

  // LCM(2, 3) = 6
  assertEquals(result, [
    [true, 10],
    [false, 20],
    [true, 30],
    [false, 10],
    [true, 20],
    [false, 30],
  ]);
});

test("cycleZip - coprime lengths (5 and 7)", () => {
  const arr1 = [1, 2, 3, 4, 5];
  const arr2 = ["a", "b", "c", "d", "e", "f", "g"];
  const result = cycleZip(arr1, arr2);

  // LCM(5, 7) = 35 (coprime numbers)
  assertEquals(result.length, 35);
  assertEquals(result[0], [1, "a"]);
  assertEquals(result[34], [5, "g"]);
});

test("cycleZip - verify cycling behavior", () => {
  const arr1 = [1, 2];
  const arr2 = ["a"];
  const result = cycleZip(arr1, arr2);

  // LCM(2, 1) = 2
  assertEquals(result, [
    [1, "a"],
    [2, "a"],
  ]);
});

test("cycleZip - objects and arrays", () => {
  const arr1 = [{ id: 1 }, { id: 2 }];
  const arr2 = [[1, 2], [3, 4], [5, 6]];
  const result = cycleZip(arr1, arr2);

  // LCM(2, 3) = 6
  assertEquals(result.length, 6);
  assertEquals(result[0], [{ id: 1 }, [1, 2]]);
  assertEquals(result[1], [{ id: 2 }, [3, 4]]);
  assertEquals(result[2], [{ id: 1 }, [5, 6]]);
});
