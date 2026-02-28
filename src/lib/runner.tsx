import { Provider } from "react-redux";
import { store } from "../app/store.ts";
import { renderTui } from "./opentui_render.tsx";

export async function runTuiWithRedux(
  component: React.ReactNode,
) {
  try {
    const wrappedComponent = (
      <Provider store={store}>
        {component}
      </Provider>
    );

    const instance = renderTui(wrappedComponent);

    await instance.waitUntilExit();
  } catch (err) {
    console.error("Fatal Error in TUI Runtime:");
    console.error(err);
    process.exit(1);
  }
}
