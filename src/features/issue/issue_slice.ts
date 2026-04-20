import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
  errAsync,
  okAsync,
} from "neverthrow";
import type z from "zod";
import { createAppAsyncThunk } from "../../app/hooks.ts";
import {
  fromPromiseWithMessage,
  fromThrowableWithMessage,
} from "../../helpers/error/neverthrow.ts";
import {
  parseMarkdownIssueTemplate,
  stringifyMarkdownIssue,
} from "../../features/issue/domain/parser.ts";
import { getIssueTemplatePath } from "../../features/issue/domain/template_paths.ts";
import type { IssueSchema } from "../../schema.ts";
import { editText } from "../../services/editor/edit_text.ts";
import { createIssue as createIssueService } from "../../services/github/issue.ts";
import type { Issue, IssueTemplate } from "../../type.ts";

// Preserve existing state type
export type IssueState =
  | { step: "loading_templates" }
  | { step: "select_template"; templates: IssueTemplate[] }
  | { step: "input_overview"; template: IssueTemplate }
  | { step: "generating"; template: IssueTemplate; overview: string }
  | { step: "select_issue"; issues: z.infer<typeof IssueSchema> }
  | { step: "edit_issue"; selectedIssue: Issue }
  | { step: "creating"; finalIssue: Issue }
  | { step: "done"; url: string }
  | { step: "error"; message: string };

const initialState: IssueState = {
  step: "loading_templates",
} as IssueState;

type IssueThunkConfig = {
  rejectValue: string;
};

const parseIssueTemplate = fromThrowableWithMessage(parseMarkdownIssueTemplate);

// Async thunks
export const loadTemplates = createAppAsyncThunk<
  IssueTemplate[],
  void,
  IssueThunkConfig
>(
  "issue/loadTemplates",
  async (_, { rejectWithValue }) => {
    return fromPromiseWithMessage(getIssueTemplatePath())
      .andThen((issueTemplatePath) =>
        fromPromiseWithMessage(
          Promise.all(
            issueTemplatePath.markdown.map(async (markdownPath) =>
              parseMarkdownIssueTemplate(await Bun.file(markdownPath).text())
            ),
          ),
        )
      )
      .andThen((issueTemplates) =>
        issueTemplates.length === 0
          ? errAsync("No templates found")
          : okAsync(issueTemplates)
      )
      .match((issueTemplates) => issueTemplates, rejectWithValue);
  },
);

export const editIssue = createAppAsyncThunk<Issue, Issue, IssueThunkConfig>(
  "issue/edit",
  async (selectedIssue: Issue, { rejectWithValue }) => {
    const markdown = stringifyMarkdownIssue(selectedIssue);

    return fromPromiseWithMessage(editText(markdown))
      .andThen((editedMarkdown) => parseIssueTemplate(editedMarkdown))
      .map((editedIssueTemplate) => ({
        title: editedIssueTemplate.title,
        body: editedIssueTemplate.body,
      }))
      .match((issue) => issue, rejectWithValue);
  },
);

export const createIssue = createAppAsyncThunk<string, Issue, IssueThunkConfig>(
  "issue/create",
  async (finalIssue: Issue, { rejectWithValue }) => {
    return fromPromiseWithMessage(createIssueService(finalIssue.title, finalIssue.body))
      .map((response) => response.url)
      .match((url) => url, rejectWithValue);
  },
);

// Slice
const issueSlice = createSlice({
  name: "issue",
  initialState,
  reducers: {
    selectTemplate: (_state, action) => {
      return {
        step: "input_overview",
        template: action.payload,
      };
    },
    submitOverview: (state, action) => {
      if (state.step === "input_overview") {
        return {
          step: "generating",
          template: state.template,
          overview: action.payload,
        };
      }
      return state;
    },
    setGeneratedIssues: (_state, action) => {
      return { step: "select_issue", issues: action.payload };
    },
    selectIssue: (_state, action) => {
      return {
        step: "edit_issue",
        selectedIssue: action.payload,
      };
    },
    setError: (_state, action: PayloadAction<string>) => {
      return { step: "error", message: action.payload };
    },
    reset: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadTemplates.fulfilled, (_state, action) => {
        return {
          step: "select_template",
          templates: action.payload,
        };
      })
      .addCase(loadTemplates.rejected, (_state, action) => {
        return {
          step: "error",
          message: action.payload ?? "Failed to load issue templates.",
        };
      })
      .addCase(editIssue.fulfilled, (_state, action) => {
        return { step: "creating", finalIssue: action.payload };
      })
      .addCase(editIssue.rejected, (_state, action) => {
        return {
          step: "error",
          message: action.payload ?? "Failed to edit the issue draft.",
        };
      })
      .addCase(createIssue.fulfilled, (_state, action) => {
        return { step: "done", url: action.payload };
      })
      .addCase(createIssue.rejected, (_state, action) => {
        return {
          step: "error",
          message: action.payload ?? "Failed to create the issue.",
        };
      });
  },
});

export const {
  selectTemplate,
  submitOverview,
  setGeneratedIssues,
  selectIssue,
  setError,
  reset,
} = issueSlice.actions;

export const issueReducer = issueSlice.reducer;
