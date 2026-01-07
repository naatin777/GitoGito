import { render } from "ink";
import React from "react";
import { Provider } from "react-redux";
import { store } from "../store/index.ts";

const encoder = new TextEncoder();
// const write = (txt: string) => Deno.stdout.writeSync(encoder.encode(txt));
// const ENTER_ALT_SCREEN = "\x1b[?1049h\x1b[2J\x1b[H";
// const EXIT_ALT_SCREEN = "\x1b[?1049l";

export async function runTui(component: React.ReactNode, isAltScreen = true) {
  // write(isAltScreen ? ENTER_ALT_SCREEN : "");

  try {
    const wrappedComponent = React.createElement(
      Provider,
      { store, children: component },
    );
    const instance = render(wrappedComponent);

    await instance.waitUntilExit();
  } catch (err) {
    console.error(err);
  } finally {
    // write(isAltScreen ? EXIT_ALT_SCREEN : "");
  }
}
