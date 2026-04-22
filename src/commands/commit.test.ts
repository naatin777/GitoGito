import { beforeEach, expect, mock, test } from "bun:test";

mock.module("../lib/runner.tsx", () => ({
  runFullScreenTui: mock(() => Promise.resolve()),
}));
mock.module("../app/router.tsx", () => ({
  AppRouter: () => null,
}));

const { createCommitCommand } = await import("./commit.tsx");
const { runFullScreenTui } = await import("../lib/runner.tsx");

beforeEach(() => {
  (runFullScreenTui as ReturnType<typeof mock>).mockClear();
});

test("description が設定されている", () => {
  expect(createCommitCommand().getDescription()).toBe("Commit changes to the repository");
});

test("parse() で runTuiWithRedux が呼ばれる", async () => {
  await createCommitCommand().parse([]);
  expect(runFullScreenTui).toHaveBeenCalledTimes(1);
});
