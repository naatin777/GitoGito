import { mock, test, expect, beforeEach } from "bun:test";

mock.module("../lib/runner.tsx", () => ({
  runTuiWithRedux: mock(() => Promise.resolve()),
}));
mock.module("../app/router.tsx", () => ({
  AppRouter: () => null,
}));

const { createCommitCommand } = await import("./commit.tsx");
const { runTuiWithRedux } = await import("../lib/runner.tsx");

beforeEach(() => {
  (runTuiWithRedux as ReturnType<typeof mock>).mockClear();
});

test("description が設定されている", () => {
  expect(createCommitCommand().getDescription()).toBe(
    "Commit changes to the repository",
  );
});

test("parse() で runTuiWithRedux が呼ばれる", async () => {
  await createCommitCommand().parse([]);
  expect(runTuiWithRedux).toHaveBeenCalledTimes(1);
});
