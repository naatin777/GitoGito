import { type SimpleGit, simpleGit } from "simple-git";
import { GitCommitRepository } from "./commit-repository.ts";
import { GitDiffRepository } from "./diff-repository.ts";
import { GitRemoteRepository } from "./remote-repository.ts";
import { GitRevParseRepository } from "./rev-parse-repository.ts";
import { GitStatusRepository } from "./status-repository.ts";

export class GitService {
  private readonly git: SimpleGit;
  public readonly diff: GitDiffRepository;
  public readonly commit: GitCommitRepository;
  public readonly rev_parse: GitRevParseRepository;
  public readonly status: GitStatusRepository;
  public readonly remote: GitRemoteRepository;

  constructor(git: SimpleGit = simpleGit()) {
    this.git = git;
    this.diff = new GitDiffRepository(this.git);
    this.commit = new GitCommitRepository(this.git);
    this.rev_parse = new GitRevParseRepository(this.git);
    this.status = new GitStatusRepository(this.git);
    this.remote = new GitRemoteRepository(this.git);
  }
}
