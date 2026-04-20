import { simpleGit } from "simple-git";

/**
 * Git status operations interface
 */
export interface GitStatusRepository {
  getStatus(): Promise<string>;
}

/**
 * CLI implementation of GitStatusRepository using simple-git
 */
export class GitStatusRepositoryCliImpl implements GitStatusRepository {
  async getStatus(): Promise<string> {
    return simpleGit().status().then((s) =>
      s.files.map((f) => `${f.index}${f.working_dir} ${f.path}`).join("\n")
    );
  }
}
