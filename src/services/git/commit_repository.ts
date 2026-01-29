import { type SimpleGit, simpleGit } from "simple-git";

/**
 * Git commit operations interface
 */
export interface GitCommitRepository {
  commitWithMessages(messages: string[]): Promise<string>;
}

/**
 * CLI implementation of GitCommitRepository using simple-git
 */
export class GitCommitRepositoryCliImpl implements GitCommitRepository {
  private readonly git: SimpleGit;

  constructor(git: SimpleGit = simpleGit()) {
    this.git = git;
  }

  async commitWithMessages(messages: string[]): Promise<string> {
    const result = await this.git.commit(messages);
    return result.commit || "";
  }
}
