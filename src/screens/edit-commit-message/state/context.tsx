import React, { createContext } from "react";
import {
  type FormAction,
  formReducer,
  type FormState,
  initialFormState,
} from "./formSlice.ts";
import {
  HeaderAction,
  headerReducer,
  HeaderState,
  initialHeaderState,
} from "./headerSlice.ts";

type State = {
  form: FormState;
  header: HeaderState;
};

const initialState: State = {
  form: initialFormState,
  header: initialHeaderState,
};

type Action = FormAction | HeaderAction;

const reducer = (
  state: State,
  action: Action,
) => ({
  form: formReducer(state.form, action as FormAction),
  header: headerReducer(state.header, action as HeaderAction),
});

const Context = createContext<
  {
    state: State;
    dispatch: React.Dispatch<Action>;
  } | null
>(null);

export const EditCommitMessageProvider = (
  { children }: { children: React.ReactNode },
) => {
  const [state, dispatch] = React.useReducer(
    reducer,
    initialState,
  );

  return (
    <Context.Provider value={{ state, dispatch }}>
      {children}
    </Context.Provider>
  );
};

export const useEditCommitMessageStore = () => {
  const context = React.useContext(Context);
  if (!context) {
    throw new Error(
      "useEditCommitMessageStore must be used within an EditCommitMessageProvider",
    );
  }
  return context;
};
