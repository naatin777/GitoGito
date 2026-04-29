import { expect, test } from "vitest";
import { DEFAULT_CONFIG } from "../schema/config-schema.js";
import { mergeConfigLayers } from "./config-merge.js";

test("merge order: local overrides project overrides global over defaults", () => {
  const m = mergeConfigLayers({
    global: { language: { dialogue: "ja", output: "en" } },
    project: { language: { dialogue: "fr", output: "de" } },
    local: { language: { dialogue: "de", output: "de" } },
  });
  expect(m.language.dialogue).toBe("de");
  expect(m.language.output).toBe("de");
});

test("defaults used when only partial project set", () => {
  const m = mergeConfigLayers({ project: {} });
  expect(m).toEqual(DEFAULT_CONFIG);
});
