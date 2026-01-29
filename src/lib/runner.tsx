import { Provider } from "react-redux";
import { store } from "../app/store.ts";
import { render } from "ink";

export async function runTuiWithRedux(
  component: React.ReactElement,
) {
  try {
    const wrappedComponent = (
      <Provider store={store}>
        {component}
      </Provider>
    );

    const instance = render(wrappedComponent);

    await instance.waitUntilExit();
  } catch (err) {
    console.error("Fatal Error in TUI Runtime:");
    console.error(err);
    Deno.exit(1);
  }
}
