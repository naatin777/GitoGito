import type { Suggestion } from "../../type.ts";

export const COMMIT_MESSAGE_PREFIXL: Suggestion[] = [
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
