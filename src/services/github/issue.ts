import { Octokit } from "octokit";
import { envService } from "../../services/config/env.ts";
import type { IssueCreateResponse } from "../../type.ts";
import { GitService } from "../git/git_service.ts";

export async function createIssue(
  title: string,
  body: string,
): Promise<IssueCreateResponse> {
  const gitService = new GitService();
  const { owner, repo } = await gitService.remote.getOwnerAndRepo();
  const octokit = new Octokit({ auth: await envService.getGitHubToken() });

  const response = await octokit.rest.issues.create({
    owner,
    repo,
    title: title,
    body: body,
  });

  return response.data as IssueCreateResponse;
}
