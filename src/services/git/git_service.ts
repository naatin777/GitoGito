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

  constructor(
    git: SimpleGit = simpleGit(),
    repos: {
      diff: GitDiffRepository;
      commit: GitCommitRepository;
      rev_parse: GitRevParseRepository;
      status: GitStatusRepository;
      remote: GitRemoteRepository;
    } = {
      diff: new GitDiffRepository(git),
      commit: new GitCommitRepository(git),
      rev_parse: new GitRevParseRepository(git),
      status: new GitStatusRepository(git),
      remote: new GitRemoteRepository(git),
    },
  ) {
    this.git = git;
    this.diff = repos.diff;
    this.commit = repos.commit;
    this.rev_parse = repos.rev_parse;
    this.status = repos.status;
    this.remote = repos.remote;
  }
}
