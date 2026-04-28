import { expect, test } from "vitest";
import { mergeConfigLayers } from "./config_merge.js";
import { DEFAULT_CONFIG } from "./schema/config_schema.js";

test("merge order: local overrides project overrides global over defaults", () => {
  const m = mergeConfigLayers({
    global: { language: { dialogue: "ja", output: "en" } },
    project: { language: { dialogue: "fr", output: "de" } },
    local: { language: { dialogue: "de", output: "de" } },
  });
  expect(m.language.dialogue).toBe("fr");
  expect(m.language.output).toBe("de");
});

test("defaults used when only partial project set", () => {
  const m = mergeConfigLayers({ project: {} });
  expect(m).toEqual(DEFAULT_CONFIG);
});
