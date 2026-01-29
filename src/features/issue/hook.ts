import { useEffect } from "react";
import { useApp } from "ink";
import type { IssueSchema } from "../../schema.ts";
import type z from "zod";
import type { Issue, IssueTemplate } from "../../type.ts";
import { useAppDispatch, useAppSelector } from "../../app/hooks.ts";
import {
  createIssue,
  editIssue,
  loadTemplates,
  selectIssue,
  selectTemplate,
  setError,
  setGeneratedIssues,
  submitOverview,
} from "./issue_slice.ts";

export function useIssueFlow() {
  const dispatch = useAppDispatch();
  const state = useAppSelector((state) => state.issue);
  const { exit } = useApp();

  useEffect(() => {
    if (state.step === "done" || state.step === "error") {
      exit();
    }
  }, [state.step, exit]);

  return {
    state,
    loadTemplates: async () => {
      await dispatch(loadTemplates());
    },
    selectTemplate: (template: IssueTemplate | undefined) => {
      if (template) {
        dispatch(selectTemplate(template));
      } else {
        dispatch(setError());
      }
    },
    submitOverview: (overview: string) => {
      dispatch(submitOverview(overview));
    },
    handleAgentDone: (result: z.infer<typeof IssueSchema>) => {
      if (result && result.issue.length > 0) {
        dispatch(setGeneratedIssues(result));
      } else {
        dispatch(setError());
      }
    },
    selectIssue: (issue: Issue | undefined) => {
      if (issue) {
        dispatch(selectIssue(issue));
      } else {
        dispatch(setError());
      }
    },
    editIssue: async () => {
      if (state.step === "edit_issue") {
        await dispatch(editIssue(state.selectedIssue));
      }
    },
    createIssue: async () => {
      if (state.step === "creating") {
        await dispatch(createIssue(state.finalIssue));
      }
    },
  };
}
