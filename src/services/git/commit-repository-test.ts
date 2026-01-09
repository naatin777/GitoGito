import { assertEquals } from "@std/assert";
import { GitCommitRepository } from "./commit_repository.ts";

Deno.test("commitWithMessage", async () => {
  const mockGit = {
    commit: (messages: string[]) =>
      Promise.resolve({ commit: messages.join(" -m ") }),
  };
  // @ts-expect-error: Mocking SimpleGit for testing
  const gitCommitRepository = new GitCommitRepository(mockGit);
  const result = await gitCommitRepository.commitWithMessages(["test"]);
  assertEquals(result, "test");

  const result2 = await gitCommitRepository.commitWithMessages([
    "test",
    "test2",
  ]);
  assertEquals(result2, "test -m test2");
});
