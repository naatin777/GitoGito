import { type SimpleGit, simpleGit } from "simple-git";
import {
  type GitCommitRepository,
  GitCommitRepositoryCliImpl,
} from "./commit_repository.ts";
import {
  type GitDiffRepository,
  GitDiffRepositoryCliImpl,
} from "./diff_repository.ts";
import {
  type GitRemoteRepository,
  GitRemoteRepositoryCliImpl,
} from "./remote_repository.ts";
import {
  type GitRevParseRepository,
  GitRevParseRepositoryCliImpl,
} from "./rev_parse_repository.ts";
import {
  type GitStatusRepository,
  GitStatusRepositoryCliImpl,
} from "./status_repository.ts";

/**
 * GitService aggregates all git repository operations
 */
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
      diff: new GitDiffRepositoryCliImpl(git),
      commit: new GitCommitRepositoryCliImpl(git),
      rev_parse: new GitRevParseRepositoryCliImpl(git),
      status: new GitStatusRepositoryCliImpl(git),
      remote: new GitRemoteRepositoryCliImpl(git),
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
