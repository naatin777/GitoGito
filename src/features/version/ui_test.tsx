import { render } from "ink-testing-library";
import { assertEquals } from "@std/assert";
import { Version } from "./ui.tsx";

Deno.test("Version component renders correctly", () => {
  const { lastFrame, unmount } = render(
    <Version name="my-cli" version="1.5.4" />,
  );
  assertEquals(lastFrame(), "my-cli version 1.5.4");
  unmount();
});

Deno.test("Version component renders correctly with different values", () => {
  const { lastFrame, unmount } = render(
    <Version name="test-app" version="2.0.0-beta" />,
  );
  assertEquals(lastFrame(), "test-app version 2.0.0-beta");
  unmount();
});
