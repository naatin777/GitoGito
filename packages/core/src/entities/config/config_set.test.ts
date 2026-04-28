import { expect, test } from "vitest";
import { formatConfigSetParseError, parseConfigSetArgs } from "./config_set.js";

test("parseConfigSetArgs accepts non-empty key and one segment", () => {
  const r = parseConfigSetArgs({ key: "foo", value: "v" });
  expect(r.success).toBe(true);
  if (r.success) {
    expect(r.data).toEqual({ key: "foo", value: "v" });
  }
});

test("parseConfigSetArgs accepts dotted key and trims key", () => {
  const r = parseConfigSetArgs({ key: "  a.b  ", value: "x" });
  expect(r.success).toBe(true);
  if (r.success) {
    expect(r.data).toEqual({ key: "a.b", value: "x" });
  }
});

test("parseConfigSetArgs allows empty value", () => {
  const r = parseConfigSetArgs({ key: "k", value: "" });
  expect(r.success).toBe(true);
  if (r.success) {
    expect(r.data).toEqual({ key: "k", value: "" });
  }
});

test("parseConfigSetArgs fails on empty or whitespace key", () => {
  const a = parseConfigSetArgs({ key: "", value: "v" });
  const b = parseConfigSetArgs({ key: "   ", value: "v" });
  expect(a.success).toBe(false);
  expect(b.success).toBe(false);
});

test("parseConfigSetArgs fails on empty key segments in dotted path", () => {
  for (const key of [".a", "a.", "a..b", ".", ".."]) {
    const r = parseConfigSetArgs({ key, value: "v" });
    expect(r.success, key).toBe(false);
  }
});

test("parseConfigSetArgs fails when value is too long", () => {
  const r = parseConfigSetArgs({ key: "k", value: "x".repeat(300_000) });
  expect(r.success).toBe(false);
});

test("formatConfigSetParseError returns a string", () => {
  const r = parseConfigSetArgs({ key: "", value: "v" });
  expect(r.success).toBe(false);
  if (!r.success) {
    const m = formatConfigSetParseError(r.error);
    expect(typeof m).toBe("string");
    expect(m.length).toBeGreaterThan(0);
  }
});
