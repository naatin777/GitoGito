import type { ThemeMode } from "@opentui/core";
import { useRenderer } from "@opentui/react";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

const ThemeModeContext = createContext<ThemeMode | null>(null);

export function ThemeModeProvider({ children }: { children: ReactNode }) {
  const renderer = useRenderer();
  const [themeMode, setThemeMode] = useState<ThemeMode | null>(
    renderer.themeMode ?? null,
  );

  useEffect(() => {
    setThemeMode(renderer.themeMode ?? null);

    const handler = (mode: ThemeMode) => setThemeMode(mode);
    renderer.on("theme_mode", handler);
    return () => {
      renderer.off("theme_mode", handler);
    };
  }, [renderer]);

  return (
    <ThemeModeContext.Provider value={themeMode}>
      {children}
    </ThemeModeContext.Provider>
  );
}

export function useThemeMode(): ThemeMode | null {
  return useContext(ThemeModeContext);
}
