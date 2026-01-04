import type { CommitConfig } from "../../type.ts";
import { DEFAULT_COMMIT_CONFIG } from "../../constants/commit-message/prefix.ts";

export type TokenType =
  | "type"
  | "scope"
  | "punctuation"
  | "word"
  | "whitespace"
  | "code"
  | "tag";

export type UserSituation =
  | "editing_type"
  | "waiting_scope_or_colon"
  | "starting_scope"
  | "editing_scope"
  | "waiting_colon"
  | "editing_description"
  | "editing_code"
  | "editing_tag"
  | "unknown";

export const getCommitPrefixState = (
  message: string,
  cursorIndex: number,
  config: CommitConfig = DEFAULT_COMMIT_CONFIG,
): UserSituation => {
  const firstColonIndex = message.indexOf(":");
  if (firstColonIndex === -1 || cursorIndex <= firstColonIndex) {
    const headerText = firstColonIndex !== -1
      ? message.slice(0, firstColonIndex)
      : message;

    const openParenIndex = headerText.indexOf("(");
    const closeParenIndex = headerText.indexOf(")");

    if (openParenIndex === -1) {
      if (headerText.endsWith("!")) {
        const typePart = headerText.slice(0, -1);
        if (config.type.some((t) => t.value === typePart)) {
          return "waiting_colon";
        }
      }

      const trimmedHeader = headerText.trimEnd();
      const isKnownType = config.type.some((t) => t.value === trimmedHeader);

      if (isKnownType && cursorIndex >= trimmedHeader.length) {
        return "waiting_scope_or_colon";
      }

      return "editing_type";
    }

    if (cursorIndex <= openParenIndex) {
      return "editing_type";
    }

    if (closeParenIndex === -1 || cursorIndex <= closeParenIndex) {
      return "editing_scope";
    }

    return "waiting_colon";
  }
  return "unknown";
};
