import { render } from "ink-testing-library";
import { Provider } from "react-redux";
import { store } from "../app/store.ts";
import { StrictMode } from "react";

export function renderTuiWithRedux(
  component: React.ReactElement,
) {
  const wrapper = render(
    <StrictMode>
      <Provider store={store}>
        {component}
      </Provider>
    </StrictMode>,
  );

  return wrapper;
}
