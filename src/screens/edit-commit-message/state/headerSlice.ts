import { COMMIT_MESSAGE_PREFIXL } from "../../../constants/commit-message/prefix.ts";
import type { Suggestion } from "../../../type.ts";

export type HeaderState = {
  value: string;
  cursor: number;
  suggestion: Suggestion[];
  filteredSuggestion: Suggestion[];
  suggestionIndex: number | undefined;
};

export const initialHeaderState: HeaderState = {
  value: "",
  cursor: 0,
  suggestion: COMMIT_MESSAGE_PREFIXL,
  filteredSuggestion: COMMIT_MESSAGE_PREFIXL,
  suggestionIndex: undefined,
};

export type HeaderAction =
  | { type: "HEADER_TYPE"; char: string }
  | { type: "HEADER_DELETE" }
  | { type: "HEADER_CURSOR_LEFT" }
  | { type: "HEADER_CURSOR_RIGHT" }
  | { type: "HEADER_GO_TO_START" }
  | { type: "HEADER_GO_TO_END" }
  | { type: "HEADER_SUGGESTION_NEXT" }
  | { type: "HEADER_SUGGESTION_PREV" }
  | { type: "HEADER_SUGGESTION_ACCEPT" }
  | { type: "HEADER_SUGGESTION_CANCEL" };

export const headerReducer = (
  state: HeaderState,
  action: HeaderAction,
): HeaderState => {
  switch (action.type) {
    case "HEADER_TYPE":
      return {
        ...state,
        value: state.value.slice(0, state.cursor) + action.char +
          state.value.slice(state.cursor),
        cursor: state.cursor + action.char.length,
        filteredSuggestion: state.suggestion.filter((suggestion) =>
          suggestion.value.startsWith(state.value + action.char)
        ),
      };
    case "HEADER_DELETE":
      if (state.cursor === 0) return state;
      return {
        ...state,
        value: state.value.slice(0, state.cursor - 1) +
          state.value.slice(state.cursor),
        cursor: state.cursor - 1,
        filteredSuggestion: state.suggestion.filter((suggestion) =>
          suggestion.value.startsWith(state.value.slice(0, state.cursor - 1))
        ),
      };
    case "HEADER_CURSOR_LEFT":
      return {
        ...state,
        cursor: Math.max(0, state.cursor - 1),
      };
    case "HEADER_CURSOR_RIGHT":
      return {
        ...state,
        cursor: Math.min(state.value.length, state.cursor + 1),
      };
    case "HEADER_GO_TO_START":
      return { ...state, cursor: 0 };
    case "HEADER_GO_TO_END":
      return { ...state, cursor: state.value.length };
    case "HEADER_SUGGESTION_NEXT":
      return {
        ...state,
        suggestionIndex: state.suggestionIndex === undefined
          ? 0
          : (state.suggestionIndex + 1) % state.filteredSuggestion.length,
      };
    case "HEADER_SUGGESTION_PREV":
      return {
        ...state,
        suggestionIndex: state.suggestionIndex === undefined
          ? undefined
          : (state.suggestionIndex - 1 + state.filteredSuggestion.length) %
            state.filteredSuggestion.length,
      };
    case "HEADER_SUGGESTION_ACCEPT":
      return {
        ...state,
        value: state.filteredSuggestion[state.suggestionIndex!].value,
        cursor: state.filteredSuggestion[state.suggestionIndex!].value.length,
        suggestionIndex: undefined,
      };
    case "HEADER_SUGGESTION_CANCEL":
      return {
        ...state,
        suggestionIndex: undefined,
      };
    default:
      return state;
  }
};
