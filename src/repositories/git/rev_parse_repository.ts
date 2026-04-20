import { simpleGit } from "simple-git";

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
  async isGitRepository(): Promise<boolean> {
    try {
      await simpleGit().revparse(["--is-inside-work-tree"]);
      return true;
    } catch {
      return false;
    }
  }
}
