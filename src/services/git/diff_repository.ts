import { type SimpleGit, simpleGit } from "simple-git";

export class GitDiffRepository {
  private readonly git: SimpleGit;

  constructor(git: SimpleGit = simpleGit()) {
    this.git = git;
  }

  async getGitDiffStaged(): Promise<string> {
    return await this.git.diff([
      "--cached",
      "--unified=0",
      "--color=never",
      "--no-prefix",
    ]);
  }

  async getGitDiffStagedName(): Promise<string> {
    return await this.git.diff([
      "--cached",
      "--name-only",
    ]);
  }

  async getStagedFileNames(): Promise<string[]> {
    const name = await this.getGitDiffStagedName();
    return name.split(/\r\n|\r|\n/).filter((value) => value);
  }

  async getGitDiffUnstaged(): Promise<string> {
    return await this.git.diff([
      "--unified=0",
      "--color=never",
      "--no-prefix",
    ]);
  }

  async getGitDiffUnstagedName(): Promise<string> {
    return await this.git.diff([
      "--name-only",
    ]);
  }

  async getUnStagedFileNames(): Promise<string[]> {
    const name = await this.getGitDiffUnstagedName();
    return name.split(/\r\n|\r|\n/).filter((value) => value);
  }
}
