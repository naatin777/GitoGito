import path from "node:path";
import i18n from "i18next";
import Backend from "i18next-fs-backend";
import { initReactI18next } from "react-i18next";

type TargetLanguage = "en" | "ja";

export const initI18n = async (targetLanguage: TargetLanguage) => {
  const localesPath = path.join(import.meta.dir, "../../locales/{{lng}}/{{ns}}.json");
  await i18n
    .use(initReactI18next)
    .use(Backend)
    .init({
      lng: targetLanguage,
      fallbackLng: "en",
      backend: {
        loadPath: localesPath,
      },
    });
};

export default i18n;
