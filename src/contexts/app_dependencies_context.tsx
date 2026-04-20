import { createContext, useContext, type ReactNode } from "react";
import type { AppDependencies } from "../app/store.ts";

const AppDependenciesContext = createContext<AppDependencies | null>(null);

export function AppDependenciesProvider({
  value,
  children,
}: {
  value: AppDependencies;
  children: ReactNode;
}) {
  return (
    <AppDependenciesContext.Provider value={value}>
      {children}
    </AppDependenciesContext.Provider>
  );
}

export function useAppDependencies(): AppDependencies {
  const ctx = useContext(AppDependenciesContext);
  if (!ctx) {
    throw new Error("useAppDependencies must be used within AppDependenciesProvider");
  }
  return ctx;
}
