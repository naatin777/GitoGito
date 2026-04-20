import type { RouteObject } from "react-router";
import { CommitUI } from "./ui.tsx";

export const commitRoute = {
  path: "commit",
  element: <CommitUI />,
} satisfies RouteObject;
