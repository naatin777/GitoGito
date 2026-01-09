import { type SimpleGit, simpleGit } from "simple-git";

export class GitRevParseRepository {
  private readonly git: SimpleGit;

  constructor(git: SimpleGit = simpleGit()) {
    this.git = git;
  }

  async isGitRepository(): Promise<boolean> {
    try {
      const result = await this.git.revparse(["--is-inside-work-tree"]);
      return result.trim() === "true";
    } catch {
      return false;
    }
  }
}
