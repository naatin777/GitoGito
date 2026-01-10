import { type SimpleGit, simpleGit } from "simple-git";

export class GitCommitRepository {
  private readonly git: SimpleGit;

  constructor(git: SimpleGit = simpleGit()) {
    this.git = git;
  }

  async commitWithMessages(messages: string[]): Promise<string> {
    const result = await this.git.commit(messages);
    return result.commit || "";
  }
}
