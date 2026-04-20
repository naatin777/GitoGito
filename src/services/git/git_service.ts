import {
  type GitCommitRepository,
  GitCommitRepositoryCliImpl,
} from "../../repositories/git/commit_repository.ts";
import {
  type GitDiffRepository,
  GitDiffRepositoryCliImpl,
} from "../../repositories/git/diff_repository.ts";
import {
  type GitRemoteRepository,
  GitRemoteRepositoryCliImpl,
} from "../../repositories/git/remote_repository.ts";
import {
  type GitRevParseRepository,
  GitRevParseRepositoryCliImpl,
} from "../../repositories/git/rev_parse_repository.ts";
import {
  type GitStatusRepository,
  GitStatusRepositoryCliImpl,
} from "../../repositories/git/status_repository.ts";

/**
 * GitService aggregates all git repository operations
 */
export class GitService {
  public readonly diff: GitDiffRepository;
  public readonly commit: GitCommitRepository;
  public readonly rev_parse: GitRevParseRepository;
  public readonly status: GitStatusRepository;
  public readonly remote: GitRemoteRepository;

  constructor(
    repos: {
      diff: GitDiffRepository;
      commit: GitCommitRepository;
      rev_parse: GitRevParseRepository;
      status: GitStatusRepository;
      remote: GitRemoteRepository;
    } = {
      diff: new GitDiffRepositoryCliImpl(),
      commit: new GitCommitRepositoryCliImpl(),
      rev_parse: new GitRevParseRepositoryCliImpl(),
      status: new GitStatusRepositoryCliImpl(),
      remote: new GitRemoteRepositoryCliImpl(),
    },
  ) {
    this.diff = repos.diff;
    this.commit = repos.commit;
    this.rev_parse = repos.rev_parse;
    this.status = repos.status;
    this.remote = repos.remote;
  }
}
