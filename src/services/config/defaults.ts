import { EDITORS } from "../../constants/editor.ts";
import { LANGUAGES } from "../../constants/language.ts";
import type { CommitConfig, Config, Suggestion } from "./schema.ts";

/**
 * デフォルトの基本設定
 */
export const defaultConfig: Config = {
  editor: EDITORS[0].value,
  language: LANGUAGES[0].label,
  overview: "",
  provider: "ChatGPT",
  model: "",
};

/**
 * デフォルトのコミットタイプサジェスチョン
 */
export const DEFAULT_COMMIT_TYPES: Suggestion[] = [
  { value: "fix", description: "A bug fix" },
  { value: "feat", description: "A new feature" },
  { value: "docs", description: "Documentation only changes" },
  {
    value: "style",
    description:
      "Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc.)",
  },
  {
    value: "refactor",
    description: "A code change that neither fixes a bug or adds a feature",
  },
  {
    value: "test",
    description: "Adding missing tests or correcting existing tests",
  },
  {
    value: "chore",
    description:
      "Changes to the build process or auxiliary tools and libraries such as documentation generation",
  },
  { value: "perf", description: "A code change that improves performance" },
  {
    value: "ci",
    description:
      "Changes to the build process or auxiliary tools and libraries such as documentation generation",
  },
  {
    value: "build",
    description:
      "Changes to the build process or auxiliary tools and libraries such as documentation generation",
  },
  {
    value: "release",
    description:
      "Changes to the build process or auxiliary tools and libraries such as documentation generation",
  },
] as const satisfies Suggestion[];

/**
 * デフォルトのスコープサジェスチョン
 * 注: 将来的にはプロジェクトのディレクトリ構造から動的に生成する予定
 */
export const DEFAULT_COMMIT_SCOPES: Suggestion[] = [
  { value: "src", description: "Source code changes" },
  { value: "components", description: "UI components" },
  { value: "api", description: "API related changes" },
  { value: "lib", description: "Library code" },
  { value: "features", description: "Feature modules" },
  { value: "services", description: "Service layer" },
  { value: "helpers", description: "Helper utilities" },
  { value: "store", description: "State management" },
  { value: "types", description: "Type definitions" },
  { value: "config", description: "Configuration files" },
  { value: "tests", description: "Test files" },
  { value: "docs", description: "Documentation" },
] as const satisfies Suggestion[];

/**
 * デフォルトのコミット設定
 */
export const DEFAULT_COMMIT_CONFIG: CommitConfig = {
  rules: {
    maxHeaderLength: 50,
    requireScope: false,
  },
  type: DEFAULT_COMMIT_TYPES,
  scope: DEFAULT_COMMIT_SCOPES,
};
