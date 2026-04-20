import { Octokit } from "octokit";
import type { IssueCreateResponse } from "../../type.ts";
import { createCredentialService } from "../credential/credential_service.ts";
import { GitService } from "../git/git_service.ts";

export async function createIssue(
  title: string,
  body: string,
): Promise<IssueCreateResponse> {
  const gitService = new GitService();
  const credentialService = createCredentialService();
  const { owner, repo } = await gitService.remote.getOwnerAndRepo();
  const { githubToken } = await credentialService.getMergedCredentials();
  const octokit = new Octokit({ auth: githubToken });

  const response = await octokit.rest.issues.create({
    owner,
    repo,
    title: title,
    body: body,
  });

  return response.data as IssueCreateResponse;
}
