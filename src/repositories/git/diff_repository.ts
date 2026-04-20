import git from "isomorphic-git";
import fs from "node:fs";
import { simpleGit } from "simple-git";

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
  /** Read file content from HEAD and STAGE for TUI diff display */
  getBlobsForDiff(
    filepath: string,
  ): Promise<{ headText: string; stageText: string }>;
}

/**
 * CLI implementation of GitDiffRepository.
 * Text-based diff methods use simple-git (delegates to native git).
 * Blob-level methods use isomorphic-git (needed for partial staging UI).
 */
export class GitDiffRepositoryCliImpl implements GitDiffRepository {
  async getGitDiffStaged(): Promise<string> {
    return simpleGit().diff(["--cached", "--unified=0", "--no-prefix"]);
  }

  async getGitDiffStagedName(): Promise<string> {
    return simpleGit().diff(["--cached", "--name-only"]);
  }

  async getStagedFileNames(): Promise<string[]> {
    const raw = await this.getGitDiffStagedName();
    return raw.split(/\r?\n/).filter(Boolean);
  }

  async getGitDiffUnstaged(): Promise<string> {
    return simpleGit().diff(["--unified=0", "--no-prefix"]);
  }

  async getGitDiffUnstagedName(): Promise<string> {
    return simpleGit().diff(["--name-only"]);
  }

  async getUnStagedFileNames(): Promise<string[]> {
    const raw = await this.getGitDiffUnstagedName();
    return raw.split(/\r?\n/).filter(Boolean);
  }

  async getBlobsForDiff(
    filepath: string,
  ): Promise<{ headText: string; stageText: string }> {
    const dir = await git.findRoot({ fs, filepath: process.cwd() });

    let headText = "";
    try {
      const headOid = await git.resolveRef({ fs, dir, ref: "HEAD" });
      const { blob } = await git.readBlob({ fs, dir, oid: headOid, filepath });
      headText = new TextDecoder().decode(blob);
    } catch {
      // file not in HEAD (new file)
    }

    let stageText = "";
    try {
      const matrix = await git.statusMatrix({ fs, dir, filepaths: [filepath] });
      const row = matrix[0];
      if (row && row[3] !== 0) {
        // stage has content: read via STAGE walk
        await git.walk({
          fs,
          dir,
          trees: [git.STAGE()],
          map: async (walkPath, [entry]) => {
            if (walkPath !== filepath || !entry) return;
            if (await entry.type() === "tree") return;
            stageText = new TextDecoder().decode(
              await entry.content() as Uint8Array,
            );
          },
        });
      }
    } catch {
      // no staged version
    }

    return { headText, stageText };
  }
}
