import type { RouteObject } from "react-router";
import { DonePage } from "./done_page.tsx";
import { InitLayout } from "./layout.tsx";
import { ProfilePage } from "./profile_page.tsx";
import { ReviewPage } from "./review_page.tsx";
import { ThemePage } from "./theme_page.tsx";

export const initRoute = {
  path: "init",
  element: <InitLayout />,
  children: [
    {
      index: true,
      element: <ThemePage />,
    },
    {
      path: "profile",
      element: <ProfilePage />,
    },
    {
      path: "review",
      element: <ReviewPage />,
    },
    {
      path: "done",
      element: <DonePage />,
    },
  ],
} satisfies RouteObject;
