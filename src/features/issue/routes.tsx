import type { RouteObject } from "react-router";
import { IssueUI } from "./ui.tsx";

export const issueRoute = {
  path: "issue",
  element: <IssueUI />,
} satisfies RouteObject;
