import { DEFAULT_COMMIT_CONFIG } from "../../../../constants/commit_message/prefix.ts";
import type { CommitConfig } from "../../../../type.ts";
import { getCommitDescriptionState } from "./get_commit_description_state.ts";
import { getCommitPrefixState } from "./get_commit_prefix_state.ts";

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

export const getCommitHeaderState = (
  message: string,
  cursorIndex: number,
  config: CommitConfig = DEFAULT_COMMIT_CONFIG,
) => {
  const clipedMessage = message.slice(0, cursorIndex);

  const colonIndex = clipedMessage.indexOf(":");
  const isCursorInPrefix = cursorIndex <= colonIndex;

  if (colonIndex === -1 || isCursorInPrefix) {
    return getCommitPrefixState(clipedMessage, cursorIndex, config);
  } else {
    return getCommitDescriptionState(clipedMessage, cursorIndex, config);
  }
};
