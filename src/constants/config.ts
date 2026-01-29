import type { Config } from "../services/config/index.ts";
import { EDITORS } from "./editor.ts";
import { LANGUAGES } from "./language.ts";

export const defaultConfig: Config = {
  editor: EDITORS[0].value,
  language: LANGUAGES[0].label,
  overview: "",
  provider: "ChatGPT",
  model: "",
};
