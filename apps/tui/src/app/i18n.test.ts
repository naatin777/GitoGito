import { expect, test } from "bun:test";
import i18n, { initI18n } from "./i18n";

test("i18n default language is en", async () => {
  await initI18n("en");
  expect(i18n.language).toBe("en");
  expect(i18n.t("language")).toBe("English");
});

test("i18n language is ja", async () => {
  await initI18n("ja");
  expect(i18n.language).toBe("ja");
  expect(i18n.t("language")).toBe("日本語");
});
