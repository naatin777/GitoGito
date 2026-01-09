import { DEFAULT_COMMIT_CONFIG } from "../../../../constants/commit-message/prefix.ts";
import type { CommitConfig } from "../../../../type.ts";
import type { UserSituation } from "./get_commit_state.ts";

export const getCommitDescriptionState = (
  message: string,
  _cursorIndex: number,
  _config: CommitConfig = DEFAULT_COMMIT_CONFIG,
): UserSituation => {
  const colonIndex = message.indexOf(":");
  const descriptionPart = message.slice(colonIndex + 1);

  const backtickCount = (descriptionPart.match(/`/g) || []).length;
  if (backtickCount % 2 !== 0) {
    return "editing_code";
  }

  const lastOpenBracketIndex = descriptionPart.lastIndexOf("[");
  const lastCloseBracketIndex = descriptionPart.lastIndexOf("]");

  if (
    lastOpenBracketIndex !== -1 &&
    lastOpenBracketIndex > lastCloseBracketIndex
  ) {
    return "editing_tag";
  }

  return "editing_description";
};
