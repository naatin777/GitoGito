import { GitService } from "../git/git-service.ts";
import { Octokit } from "octokit";
import type { IssueCreateResponse } from "../../type.ts";
import { envService } from "../../services/env.ts";

export async function createIssue(
  title: string,
  body: string,
): Promise<IssueCreateResponse> {
  const gitService = new GitService();
  const { owner, repo } = await gitService.remote.getOwnerAndRepo();
  const octokit = new Octokit({ auth: await envService.getGitHubToken() });

  const issue: IssueCreateResponse = await octokit.rest.issues.create({
    owner,
    repo,
    title: title,
    body: body,
  });

  return issue;
}
