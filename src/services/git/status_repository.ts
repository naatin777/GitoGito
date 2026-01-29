import { type SimpleGit, simpleGit } from "simple-git";

/**
 * Git status operations interface
 */
export interface GitStatusRepository {
  getStatus(): Promise<string>;
}

/**
 * CLI implementation of GitStatusRepository using simple-git
 */
export class GitStatusRepositoryCliImpl implements GitStatusRepository {
  private readonly git: SimpleGit;

  constructor(git: SimpleGit = simpleGit()) {
    this.git = git;
  }

  async getStatus(): Promise<string> {
    const statusSummary = await this.git.status();
    return JSON.stringify(statusSummary, null, 2);
  }
}
