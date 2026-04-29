import { expect, test } from "bun:test";
import { formatConfigSetParseError, parseConfigSetArgs } from "@gitogito/core";

test("app resolves @gitogito/shared config set schema", () => {
  const bad = parseConfigSetArgs({ key: "", value: "v" });
  expect(bad.success).toBe(false);
  if (!bad.success) {
    expect(formatConfigSetParseError(bad.error).length).toBeGreaterThan(0);
  }
  const good = parseConfigSetArgs({ key: "a.b", value: "v" });
  expect(good.success).toBe(true);
  if (good.success) {
    expect(good.data).toEqual({ key: "a.b", value: "v" });
  }
});
