import { TextAttributes } from "@opentui/core";
import { useKeyboard, useRenderer } from "@opentui/react";
import { useMemo } from "react";
import {
  createMemoryRouter,
  Outlet,
  RouterProvider,
  useLocation,
  useNavigate,
} from "react-router";
import { Commit } from "../../features/commit/ui.tsx";
import { ConfigUI } from "../../features/config/ui.tsx";
import { Issue } from "../../features/issue/ui.tsx";
import { flatSchema } from "../../helpers/flat_schema.ts";
import { isCtrlC, keyEventToInput } from "../../helpers/opentui/key.ts";
import { ConfigSchema } from "../../services/config/schema/config.ts";

type RouterPath = "/" | "/commit" | "/issue" | "/config";

const flattenConfigSchema = flatSchema(ConfigSchema);

function RouterShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const renderer = useRenderer();

  useKeyboard((event) => {
    const input = keyEventToInput(event);

    if (isCtrlC(event) || input === "q") {
      renderer.destroy();
      return;
    }

    if (event.ctrl && input === "b" && location.pathname !== "/") {
      navigate("/");
    }
  });

  return (
    <box flexDirection="column">
      <box paddingX={1}>
        <text attributes={TextAttributes.BOLD} fg="cyan">
          gitogito
        </text>
        <text>{`  route: ${location.pathname}`}</text>
      </box>
      <box paddingX={1}>
        <text attributes={TextAttributes.DIM}>
          ctrl+b:home q:quit ctrl+c:quit
        </text>
      </box>
      <box marginTop={1}>
        <Outlet />
      </box>
    </box>
  );
}

function Home() {
  const navigate = useNavigate();
  const renderer = useRenderer();

  useKeyboard((event) => {
    const input = keyEventToInput(event);

    if (isCtrlC(event) || input === "q") {
      renderer.destroy();
      return;
    }

    if (input === "1" || input === "c") {
      navigate("/commit");
    } else if (input === "2" || input === "i") {
      navigate("/issue");
    } else if (input === "3" || input === "g") {
      navigate("/config");
    } else if (event.name === "return" || event.name === "enter") {
      navigate("/commit");
    }
  });

  return (
    <box flexDirection="column" paddingX={1}>
      <text attributes={TextAttributes.BOLD}>Select Flow</text>
      <text>1 / c : Commit</text>
      <text>2 / i : Issue</text>
      <text>3 / g : Config</text>
      <text attributes={TextAttributes.DIM}>Enter defaults to Commit</text>
    </box>
  );
}

function ConfigRoute() {
  return <ConfigUI flattenConfigSchema={flattenConfigSchema} />;
}

export function RouterUI({ initialPath = "/" }: { initialPath?: RouterPath }) {
  const router = useMemo(
    () =>
      createMemoryRouter(
        [
          {
            path: "/",
            element: <RouterShell />,
            children: [
              { index: true, element: <Home /> },
              { path: "commit", element: <Commit /> },
              { path: "issue", element: <Issue /> },
              { path: "config", element: <ConfigRoute /> },
              { path: "*", element: <Home /> },
            ],
          },
        ],
        { initialEntries: [initialPath] },
      ),
    [initialPath],
  );

  return <RouterProvider router={router} />;
}
