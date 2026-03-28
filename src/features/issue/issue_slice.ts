import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { readFile } from "node:fs/promises";
import type z from "zod";
import {
  parseMarkdownIssueTemplate,
  stringifyMarkdownIssue,
} from "../../features/issue/domain/parser.ts";
import { getIssueTemplatePath } from "../../features/issue/domain/template_paths.ts";
import type { IssueSchema } from "../../schema.ts";
import { editText } from "../../services/editor.ts";
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

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  if (typeof error === "object" && error !== null) {
    try {
      return JSON.stringify(error);
    } catch {
      return "Unknown error";
    }
  }
  return String(error);
}

// Async thunks
export const loadTemplates = createAsyncThunk<
  IssueTemplate[],
  void,
  IssueThunkConfig
>(
  "issue/loadTemplates",
  async (_, { rejectWithValue }) => {
    try {
      const issueTemplatePath = await getIssueTemplatePath();
      const issueTemplates = await Promise.all(
        issueTemplatePath.markdown.map(async (markdownPath) =>
          parseMarkdownIssueTemplate(await readFile(markdownPath, "utf8"))
        ),
      );
      if (issueTemplates.length === 0) {
        return rejectWithValue("No templates found");
      }
      return issueTemplates;
    } catch (error) {
      return rejectWithValue(toErrorMessage(error));
    }
  },
);

export const editIssue = createAsyncThunk<Issue, Issue, IssueThunkConfig>(
  "issue/edit",
  async (selectedIssue: Issue, { rejectWithValue }) => {
    try {
      const markdown = stringifyMarkdownIssue(selectedIssue);
      const editedMarkdown = await editText(markdown);
      const editedIssueTemplate = parseMarkdownIssueTemplate(editedMarkdown);

      return {
        title: editedIssueTemplate.title,
        body: editedIssueTemplate.body,
      };
    } catch (error) {
      return rejectWithValue(toErrorMessage(error));
    }
  },
);

export const createIssue = createAsyncThunk<string, Issue, IssueThunkConfig>(
  "issue/create",
  async (finalIssue: Issue, { rejectWithValue }) => {
    try {
      const response = await createIssueService(
        finalIssue.title,
        finalIssue.body,
      );
      return response.url;
    } catch (error) {
      return rejectWithValue(toErrorMessage(error));
    }
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
