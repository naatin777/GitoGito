import type { CommitConfig } from "../../../../type.ts";
import { DEFAULT_COMMIT_CONFIG } from "../../../../constants/commit_message/prefix.ts";
import type { UserSituation } from "./get_commit_state.ts";

export const getCommitPrefixState = (
  message: string,
  cursorIndex: number,
  config: CommitConfig = DEFAULT_COMMIT_CONFIG,
): UserSituation => {
  const openParenIndex = message.indexOf("(");
  const closeParenIndex = message.indexOf(")");

  if (openParenIndex === -1) {
    if (message.endsWith("!")) {
      const typePart = message.slice(0, -1);
      if (config.type.some((t) => t.value === typePart)) {
        return "waiting_colon";
      }
    }

    const trimmedHeader = message.trimEnd();
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
};
