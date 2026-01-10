import { assertEquals } from "@std/assert";
import { GitStatusRepository } from "./status-repository.ts";

Deno.test("status", async () => {
  const mockStatus = {
    current: "main",
    files: [],
    ahead: 0,
    behind: 0,
  };
  const mockGit = {
    status: () => Promise.resolve(mockStatus),
  };
  // @ts-expect-error: Mocking SimpleGit for testing
  const gitStatusRepository = new GitStatusRepository(mockGit);
  const status = await gitStatusRepository.getStatus();
  assertEquals(status, JSON.stringify(mockStatus, null, 2));
});
