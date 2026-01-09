import { type SimpleGit, simpleGit } from "simple-git";

export class GitRemoteRepository {
  private readonly git: SimpleGit;

  constructor(git: SimpleGit = simpleGit()) {
    this.git = git;
  }

  async getOwnerAndRepo(): Promise<{ owner: string; repo: string }> {
    const remotes = await this.git.getRemotes(true);
    const origin = remotes.find((remote) => remote.name === "origin");

    if (!origin || !origin.refs.fetch) {
      throw new Error("Invalid remote URL");
    }

    const match = origin.refs.fetch.trim().match(
      /[:/]([^/:]+)\/([^/]+?)(?:\.git)?$/,
    );
    if (!match) throw new Error("Invalid remote URL");
    return { owner: match[1], repo: match[2] };
  }
}
