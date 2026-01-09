import { assertEquals } from "@std/assert";
import { GitDiffRepository } from "./diff-repository.ts";

Deno.test("getGitDiffStaged", async () => {
  const mockGit = {
    diff: (args: string[]) => Promise.resolve(args.join(" ")),
  };
  // @ts-expect-error: Mocking SimpleGit for testing
  const gitDiffRepository = new GitDiffRepository(mockGit);
  const result = await gitDiffRepository.getGitDiffStaged();
  assertEquals(result, "--cached --unified=0 --color=never --no-prefix");
});

Deno.test("getGitDiffStagedName", async () => {
  const mockGit = {
    diff: (args: string[]) => Promise.resolve(args.join(" ")),
  };
  // @ts-expect-error: Mocking SimpleGit for testing
  const gitDiffRepository = new GitDiffRepository(mockGit);
  const result = await gitDiffRepository.getGitDiffStagedName();
  assertEquals(result, "--cached --name-only");
});

Deno.test("getStagedFileNames", async () => {
  const mockGit = {
    diff: (_: string[]) =>
      Promise.resolve("aaa/bbb.txt\n/ccc/ddd.txt\r\neee.txt\rppp.txt\n\n"),
  };
  // @ts-expect-error: Mocking SimpleGit for testing
  const gitDiffRepository = new GitDiffRepository(mockGit);
  const result = await gitDiffRepository.getStagedFileNames();
  assertEquals(result, ["aaa/bbb.txt", "/ccc/ddd.txt", "eee.txt", "ppp.txt"]);
});

Deno.test("getGitDiffUnstaged", async () => {
  const mockGit = {
    diff: (args: string[]) => Promise.resolve(args.join(" ")),
  };
  // @ts-expect-error: Mocking SimpleGit for testing
  const gitDiffRepository = new GitDiffRepository(mockGit);
  const result = await gitDiffRepository.getGitDiffUnstaged();
  assertEquals(result, "--unified=0 --color=never --no-prefix");
});

Deno.test("getGitDiffUnstagedNames", async () => {
  const mockGit = {
    diff: (args: string[]) => Promise.resolve(args.join(" ")),
  };
  // @ts-expect-error: Mocking SimpleGit for testing
  const gitDiffRepository = new GitDiffRepository(mockGit);
  const result = await gitDiffRepository.getGitDiffUnstagedName();
  assertEquals(result, "--name-only");
});

Deno.test("getUntrackedFileNames", async () => {
  const mockGit = {
    diff: (_: string[]) =>
      Promise.resolve("aaa/bbb.txt\n/ccc/ddd.txt\r\neee.txt\rppp.txt\n\n"),
  };
  // @ts-expect-error: Mocking SimpleGit for testing
  const gitDiffRepository = new GitDiffRepository(mockGit);
  const result = await gitDiffRepository.getUnStagedFileNames();
  assertEquals(result, ["aaa/bbb.txt", "/ccc/ddd.txt", "eee.txt", "ppp.txt"]);
});
