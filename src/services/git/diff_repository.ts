import { type SimpleGit, simpleGit } from "simple-git";

/**
 * Git diff operations interface
 */
export interface GitDiffRepository {
  getGitDiffStaged(): Promise<string>;
  getGitDiffStagedName(): Promise<string>;
  getStagedFileNames(): Promise<string[]>;
  getGitDiffUnstaged(): Promise<string>;
  getGitDiffUnstagedName(): Promise<string>;
  getUnStagedFileNames(): Promise<string[]>;
}

/**
 * CLI implementation of GitDiffRepository using simple-git
 */
export class GitDiffRepositoryCliImpl implements GitDiffRepository {
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
