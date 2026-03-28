import { Provider } from "react-redux";
import { store } from "../app/store.ts";
import { renderTui } from "./opentui_render.tsx";

export async function runTuiWithRedux(
  component: React.ReactNode,
) {
  let instance: ReturnType<typeof renderTui> | undefined;

  try {
    const wrappedComponent = (
      <Provider store={store}>
        {component}
      </Provider>
    );

    instance = renderTui(wrappedComponent);

    await instance.waitUntilExit();
  } catch (err) {
    instance?.unmount();
    console.error("Fatal Error in TUI Runtime:");
    console.error(err);
    process.exitCode = 1;
  }
}
