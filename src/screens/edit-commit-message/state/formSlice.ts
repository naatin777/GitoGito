export type FormState = {
  mode: "normal" | "ai";
  focus: "header" | "body" | "footer";
};

export const initialFormState: FormState = {
  mode: "normal",
  focus: "header",
};

export type FormAction =
  | { type: "CHANGE_TO_AI_MODE" }
  | { type: "CHANGE_TO_NORMAL_MODE" }
  | { type: "FOCUS_HEADER" }
  | { type: "FOCUS_BODY" }
  | { type: "FOCUS_FOOTER" };

export const formReducer = (
  state: FormState,
  action: FormAction,
): FormState => {
  switch (action.type) {
    case "CHANGE_TO_AI_MODE":
      return { ...state, mode: "ai" };
    case "CHANGE_TO_NORMAL_MODE":
      return { ...state, mode: "normal" };
    case "FOCUS_HEADER":
      return { ...state, focus: "header" };
    case "FOCUS_BODY":
      return { ...state, focus: "body" };
    case "FOCUS_FOOTER":
      return { ...state, focus: "footer" };
    default:
      return state;
  }
};
