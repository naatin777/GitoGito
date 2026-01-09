import { assertEquals, assertRejects } from "@std/assert";
import { GitRemoteRepository } from "./remote_repository.ts";

Deno.test("getOwnerAndRepo", async () => {
  const mockGit = {
    getRemotes: (_verbose: boolean) => Promise.resolve([]),
  };
  // @ts-expect-error: Mocking SimpleGit for testing
  const gitRemoteRepository = new GitRemoteRepository(mockGit);
  await assertRejects(
    async () => await gitRemoteRepository.getOwnerAndRepo(),
    Error,
    "Invalid remote URL",
  );

  const mockGit2 = {
    getRemotes: (_verbose: boolean) =>
      Promise.resolve([
        {
          name: "origin",
          refs: { fetch: "git@github.com:naatin777/DemmitHub.git" },
        },
      ]),
  };
  // @ts-expect-error: Mocking SimpleGit for testing
  const gitRemoteRepository2 = new GitRemoteRepository(mockGit2);
  const { owner, repo } = await gitRemoteRepository2.getOwnerAndRepo();
  assertEquals(owner, "naatin777");
  assertEquals(repo, "DemmitHub");
});
