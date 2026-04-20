import { simpleGit } from "simple-git";

/**
 * Git remote operations interface
 */
export interface GitRemoteRepository {
  getOwnerAndRepo(): Promise<{ owner: string; repo: string }>;
}

/**
 * CLI implementation of GitRemoteRepository using simple-git
 */
export class GitRemoteRepositoryCliImpl implements GitRemoteRepository {
  async getOwnerAndRepo(): Promise<{ owner: string; repo: string }> {
    const remotes = await simpleGit().getRemotes(true);
    const origin = remotes.find((r) => r.name === "origin");
    const remoteUrl = origin?.refs?.fetch;

    if (!remoteUrl) throw new Error("Invalid remote URL");

    const match = remoteUrl.trim().match(/[:/]([^/:]+)\/([^/]+?)(?:\.git)?$/);
    if (!match) throw new Error("Invalid remote URL");
    return { owner: match[1], repo: match[2] };
  }
}
