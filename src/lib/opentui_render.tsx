import { createCliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/react";
import type React from "react";

export type OpenTuiRenderInstance = {
  waitUntilExit: () => Promise<void>;
  rerender: (node: React.ReactNode) => void;
  unmount: () => void;
  clear: () => void;
};

export function renderTui(node: React.ReactNode): OpenTuiRenderInstance {
  let root: ReturnType<typeof createRoot> | null = null;
  let exitResolver: (() => void) | null = null;
  let exited = false;

  const exitPromise = new Promise<void>((resolve) => {
    exitResolver = resolve;
  });

  const rendererPromise = createCliRenderer().then((renderer) => {
    renderer.once("destroy", () => {
      exited = true;
      exitResolver?.();
    });

    root = createRoot(renderer);
    root.render(node);

    return renderer;
  });

  return {
    waitUntilExit: async () => {
      await rendererPromise;
      if (!exited) {
        await exitPromise;
      }
    },
    rerender: (nextNode) => {
      void rendererPromise.then(() => {
        if (!exited) {
          root?.render(nextNode);
        }
      });
    },
    unmount: () => {
      void rendererPromise.then((renderer) => {
        root?.unmount();
        renderer.destroy();
      });
    },
    clear: () => {
      process.stdout.write("\x1bc");
    },
  };
}
