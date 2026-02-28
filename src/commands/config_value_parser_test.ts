import { expect, test } from "bun:test";
import { ConfigSchema } from "../services/config/schema/config.ts";
import {
  normalizeConfigValue,
  parseCliConfigValue,
  resolveConfigScope,
} from "./config_value_parser.ts";

test("resolveConfigScope - defaults to project", () => {
  expect(resolveConfigScope({})).toBe("project");
});

test("resolveConfigScope - local and global", () => {
  expect(resolveConfigScope({ local: true })).toBe("local");
  expect(resolveConfigScope({ global: true })).toBe("global");
});

test("parseCliConfigValue - parses primitives", () => {
  expect(parseCliConfigValue("true")).toBe(true);
  expect(parseCliConfigValue("72")).toBe(72);
});

test("parseCliConfigValue - keeps hex color as string", () => {
  expect(parseCliConfigValue("#007bff")).toBe("#007bff");
});

test("normalizeConfigValue - accepts valid value", () => {
  const config = ConfigSchema.parse({});
  const result = normalizeConfigValue(config, "commit.rules.maxHeaderLength", 80);
  expect(result.ok).toBe(true);
  if (!result.ok) return;
  expect(result.value).toBe(80);
});

test("normalizeConfigValue - rejects invalid enum", () => {
  const config = ConfigSchema.parse({});
  const result = normalizeConfigValue(config, "ai.provider", "UnknownProvider");
  expect(result.ok).toBe(false);
  if (result.ok) return;
  expect(result.message).toContain("Invalid value for");
});
