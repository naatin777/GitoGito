import { expect, test } from "bun:test";
import { testRender } from "@opentui/react/test-utils";

function Greeting({ name }: { name: string }) {
  return <text>Hello, {name}!</text>;
}

test("Greeting renders name", async () => {
  const testSetup = await testRender(<Greeting name="World" />, { width: 80, height: 24 });
  await testSetup.renderOnce();
  const frame = testSetup.captureCharFrame();
  expect(frame).toContain("Hello, World!");
});
