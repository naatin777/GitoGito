import { assertEquals } from "@std/assert";
import { GitRevParseRepository } from "./rev-parse-repository.ts";

Deno.test("isGitRepository", async () => {
  const mockGit = {
    revparse: (args: string[]) => Promise.resolve(args.join(" ")),
  };
  // @ts-expect-error: Mocking SimpleGit for testing
  const gitRevParseRepository = new GitRevParseRepository(mockGit);
  const isGitRepository = await gitRevParseRepository.isGitRepository();
  assertEquals(isGitRepository, false);

  const mockGit2 = {
    revparse: (_: string[]) => Promise.resolve("true"),
  };
  // @ts-expect-error: Mocking SimpleGit for testing
  const gitRevParseRepository2 = new GitRevParseRepository(mockGit2);
  const isGitRepository2 = await gitRevParseRepository2.isGitRepository();
  assertEquals(isGitRepository2, true);

  const mockGit3 = {
    revparse: (_: string[]) => Promise.reject("error"),
  };
  // @ts-expect-error: Mocking SimpleGit for testing
  const gitRevParseRepository3 = new GitRevParseRepository(mockGit3);
  const isGitRepository3 = await gitRevParseRepository3.isGitRepository();
  assertEquals(isGitRepository3, false);
});
