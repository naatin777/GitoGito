export type HeaderState = {
  value: string;
  cursor: number;
};

export const initialHeaderState: HeaderState = {
  value: "",
  cursor: 0,
};

export type HeaderAction =
  | { type: "TYPE"; char: string }
  | { type: "DELETE" }
  | { type: "CURSOR_LEFT" }
  | { type: "CURSOR_RIGHT" }
  | { type: "GO_TO_START" }
  | { type: "GO_TO_END" };

export const headerReducer = (
  state: HeaderState,
  action: HeaderAction,
): HeaderState => {
  switch (action.type) {
    case "TYPE":
      return {
        value: state.value.slice(0, state.cursor) + action.char +
          state.value.slice(state.cursor),
        cursor: state.cursor + action.char.length,
      };
    case "DELETE":
      if (state.cursor === 0) return state;
      return {
        value: state.value.slice(0, state.cursor - 1) +
          state.value.slice(state.cursor),
        cursor: state.cursor - 1,
      };
    case "CURSOR_LEFT":
      return {
        ...state,
        cursor: Math.max(0, state.cursor - 1),
      };
    case "CURSOR_RIGHT":
      return {
        ...state,
        cursor: Math.min(state.value.length, state.cursor + 1),
      };
    case "GO_TO_START":
      return { ...state, cursor: 0 };
    case "GO_TO_END":
      return { ...state, cursor: state.value.length };
    default:
      return state;
  }
};
