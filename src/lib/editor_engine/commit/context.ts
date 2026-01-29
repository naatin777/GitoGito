export interface CommitContext extends Record<string, string> {
  type: string;
  scope: string;
  separator: string;
  subject: string;
}
