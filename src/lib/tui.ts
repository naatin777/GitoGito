import { render } from "ink";
import React from "react";
import { Provider } from "react-redux";
import { store } from "../app/store.ts";

export async function runTui(component: React.ReactNode) {
  try {
    const wrappedComponent = React.createElement(
      Provider,
      { store, children: component },
    );
    const instance = render(wrappedComponent);

    await instance.waitUntilExit();
  } catch (err) {
    console.error(err);
  }
}
