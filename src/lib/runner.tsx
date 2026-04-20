import { createCliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/react";
import { Provider } from "react-redux";
import { createAppStore, type AppDependencies } from "../app/store.ts";
import { AppDependenciesProvider } from "../contexts/app_dependencies_context.tsx";
import { ThemeModeProvider } from "../contexts/theme_mode_context.tsx";

export async function runTui(
  component: React.ReactNode,
) {
  const renderer = await createCliRenderer({
    backgroundColor: "#FF00FF",
  })
  createRoot(renderer).render(
    <ThemeModeProvider>
      {component}
    </ThemeModeProvider>
  )
}


export type RunTuiWithReduxOptions = {
  dependencies: AppDependencies;
};

export async function runTuiWithRedux(
  component: React.ReactNode,
  { dependencies }: RunTuiWithReduxOptions,
) {
  const resolvedConfig = await dependencies.config.getMergedConfig();
  const store = createAppStore({
    config: {
      mergedConfig: resolvedConfig,
    },
    dependencies,
  });

  await runTui(
    <Provider store={store}>
      <AppDependenciesProvider value={dependencies}>{component}</AppDependenciesProvider>
    </Provider>,
  );
}
