import type { RestEndpointMethodTypes } from "@octokit/plugin-rest-endpoint-methods";

export type Issue = {
  title: string;
  body: string;
};

export type IssueTemplate = Issue & {
  name: string;
  about: string;
};

export type Choice<T> = {
  value: T;
  name: string;
  description: string;
};

export type Suggestion = {
  value: string;
  description: string;
  emoji?: string;
};

export type CommitConfig = {
  rules: {
    maxHeaderLength: number;
    requireScope: boolean;
  };
  type: Suggestion[];
};

export type IssueCreateResponse =
  RestEndpointMethodTypes["issues"]["create"]["response"];
