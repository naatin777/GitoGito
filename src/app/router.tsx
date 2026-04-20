import { useMemo } from "react";
import type { RouteObject } from "react-router";
import {
  createMemoryRouter,
  Outlet,
  RouterProvider
} from "react-router";
import { commitRoute } from "../features/commit/routes.tsx";
import { configRoute } from "../features/config/routes.tsx";
import { homeFallbackRoute, homeIndexRoute } from "../features/home/routes.tsx";
import { initRoute } from "../features/init/routes.tsx";
import { issueRoute } from "../features/issue/routes.tsx";

const routes = [
  {
    path: "/",
    element: <Outlet />,
    children: [
      homeFallbackRoute,
      initRoute,
      homeIndexRoute,
      commitRoute,
      issueRoute,
      configRoute,
    ],
  } satisfies RouteObject,
];

export function AppRouter({ initialPath = "/", params = {} }: { initialPath?: string, params?: Record<string, string> }) {
  const router = useMemo(() => {
    const searchParams = new URLSearchParams(params);
    const queryString = searchParams.toString();
    const entry = queryString ? `${initialPath}?${queryString}` : initialPath;

    return createMemoryRouter(
      routes,
      { initialEntries: [entry] },
    );
  }, [initialPath, params]);

  return <RouterProvider router={router} />;
}
