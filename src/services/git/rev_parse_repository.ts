import { type SimpleGit, simpleGit } from "simple-git";

/**
 * Git rev-parse operations interface
 */
export interface GitRevParseRepository {
  isGitRepository(): Promise<boolean>;
}

/**
 * CLI implementation of GitRevParseRepository using simple-git
 */
export class GitRevParseRepositoryCliImpl implements GitRevParseRepository {
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
