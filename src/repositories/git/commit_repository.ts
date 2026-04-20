import { simpleGit } from "simple-git";

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
  async commitWithMessages(messages: string[]): Promise<string> {
    const result = await simpleGit().commit(messages);
    return result.commit;
  }
}
