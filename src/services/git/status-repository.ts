import { type SimpleGit, simpleGit } from "simple-git";

export class GitStatusRepository {
  private readonly git: SimpleGit;

  constructor(git: SimpleGit = simpleGit()) {
    this.git = git;
  }

  async getStatus(): Promise<string> {
    const statusSummary = await this.git.status();
    return JSON.stringify(statusSummary, null, 2);
  }
}
