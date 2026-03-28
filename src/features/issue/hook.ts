import { useRenderer } from "@opentui/react";
import { useCallback, useEffect } from "react";
import type z from "zod";
import { useAppDispatch, useAppSelector } from "../../app/hooks.ts";
import {
  ISSUE_GENERATION_EMPTY_MESSAGE,
  ISSUE_SELECTION_CANCELLED_MESSAGE,
  ISSUE_TEMPLATE_CANCELLED_MESSAGE,
} from "../../constants/message.ts";
import type { IssueSchema } from "../../schema.ts";
import type { Issue, IssueTemplate } from "../../type.ts";
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
import type { IssueState } from "./issue_slice.ts";

export {
  ISSUE_GENERATION_EMPTY_MESSAGE,
  ISSUE_SELECTION_CANCELLED_MESSAGE,
  ISSUE_TEMPLATE_CANCELLED_MESSAGE,
};

export function shouldCloseIssueFlow(step: IssueState["step"]) {
  return step === "done" || step === "error";
}

export function getTemplateSelectionError(template: IssueTemplate | undefined) {
  return template ? undefined : ISSUE_TEMPLATE_CANCELLED_MESSAGE;
}

export function getGeneratedIssuesError(result: z.infer<typeof IssueSchema>) {
  return result && result.issue.length > 0
    ? undefined
    : ISSUE_GENERATION_EMPTY_MESSAGE;
}

export function getIssueSelectionError(issue: Issue | undefined) {
  return issue ? undefined : ISSUE_SELECTION_CANCELLED_MESSAGE;
}

/* v8 ignore start */
export function useIssueFlow() {
  const dispatch = useAppDispatch();
  const state = useAppSelector((state) => state.issue);
  const renderer = useRenderer();
  const { step } = state;
  const selectedIssue = state.step === "edit_issue" ? state.selectedIssue : undefined;
  const finalIssue = state.step === "creating" ? state.finalIssue : undefined;

  useEffect(() => {
    if (shouldCloseIssueFlow(step)) {
      renderer.destroy();
    }
  }, [step, renderer]);

  const loadTemplatesHandler = useCallback(async () => {
    await dispatch(loadTemplates());
  }, [dispatch]);

  const selectTemplateHandler = useCallback((template: IssueTemplate | undefined) => {
    const errorMessage = getTemplateSelectionError(template);
    if (!errorMessage && template) {
      dispatch(selectTemplate(template));
      return;
    }

    dispatch(setError(errorMessage ?? ISSUE_TEMPLATE_CANCELLED_MESSAGE));
  }, [dispatch]);

  const submitOverviewHandler = useCallback((overview: string) => {
    dispatch(submitOverview(overview));
  }, [dispatch]);

  const handleAgentDone = useCallback((result: z.infer<typeof IssueSchema>) => {
    const errorMessage = getGeneratedIssuesError(result);
    if (!errorMessage) {
      dispatch(setGeneratedIssues(result));
      return;
    }

    dispatch(setError(errorMessage));
  }, [dispatch]);

  const selectIssueHandler = useCallback((issue: Issue | undefined) => {
    const errorMessage = getIssueSelectionError(issue);
    if (!errorMessage && issue) {
      dispatch(selectIssue(issue));
      return;
    }

    dispatch(setError(errorMessage ?? ISSUE_SELECTION_CANCELLED_MESSAGE));
  }, [dispatch]);

  const editIssueHandler = useCallback(async () => {
    if (step === "edit_issue" && selectedIssue) {
      await dispatch(editIssue(selectedIssue));
    }
  }, [dispatch, selectedIssue, step]);

  const createIssueHandler = useCallback(async () => {
    if (step === "creating" && finalIssue) {
      await dispatch(createIssue(finalIssue));
    }
  }, [dispatch, finalIssue, step]);

  return {
    state,
    loadTemplates: loadTemplatesHandler,
    selectTemplate: selectTemplateHandler,
    submitOverview: submitOverviewHandler,
    handleAgentDone,
    selectIssue: selectIssueHandler,
    editIssue: editIssueHandler,
    createIssue: createIssueHandler,
  };
}
/* v8 ignore stop */
