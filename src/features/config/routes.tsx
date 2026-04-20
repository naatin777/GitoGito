import type { RouteObject } from "react-router";
import { flatSchema } from "../../helpers/flat_schema.ts";
import { ConfigSchema } from "../../services/config/schema/config_schema.ts";
import { ConfigPage } from "./config_page.tsx";

export const configRoute = {
  path: "config/*",
  element: <ConfigPage flattenConfigSchema={flatSchema(ConfigSchema)} />,
} satisfies RouteObject;
