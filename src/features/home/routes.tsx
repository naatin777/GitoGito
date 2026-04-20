import type { RouteObject } from "react-router";
import { HomeUI } from "./ui.tsx";

export const homeIndexRoute = {
  index: true,
  element: <HomeUI />,
} satisfies RouteObject;

export const homeFallbackRoute = {
  path: "*",
  element: <HomeUI />,
} satisfies RouteObject;
