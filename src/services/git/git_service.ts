import { type SimpleGit, simpleGit } from "simple-git";
import { GitCommitRepository } from "./commit_repository.ts";
import { GitDiffRepository } from "./diff_repository.ts";
import { GitRemoteRepository } from "./remote_repository.ts";
import { GitRevParseRepository } from "./rev_parse_repository.ts";
import { GitStatusRepository } from "./status_repository.ts";

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
