import { expect, test } from "vitest";
import { z } from "zod";
import { parseAsResult } from "./zod.js";

test("parseAsResult returns a Result", () => {
  const result = parseAsResult(z.string(), "hello");
  expect(result.isOk()).toBe(true);
  expect(result.isErr()).toBe(false);
  if (result.isOk()) {
    expect(result.value).toBe("hello");
  }
});

test("parseAsResult returns an Err if the data is invalid", () => {
  const result = parseAsResult(z.string(), 123);
  expect(result.isOk()).toBe(false);
  expect(result.isErr()).toBe(true);
  if (result.isErr()) {
    expect(result.error).toBeInstanceOf(z.ZodError);
  }
});
