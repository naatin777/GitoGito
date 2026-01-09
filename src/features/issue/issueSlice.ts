import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type z from "zod";
import type { IssueSchema } from "../../schema.ts";
import type { Issue, IssueTemplate } from "../../type.ts";
import { getIssueTemplatePath } from "../../features/issue/domain/template-paths.ts";
import {
  parseMarkdownIssueTemplate,
  stringifyMarkdownIssue,
} from "../../features/issue/domain/parser.ts";
import { editText } from "../../services/editor.ts";
import { createIssue as createIssueService } from "../../services/github/issue.ts";

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
  | { step: "error" };

const initialState: IssueState = {
  step: "loading_templates",
} as IssueState;

// Async thunks
export const loadTemplates = createAsyncThunk(
  "issue/loadTemplates",
  async (_, { rejectWithValue }) => {
    try {
      const issueTemplatePath = await getIssueTemplatePath();
      const issueTemplates = issueTemplatePath.markdown.map((markdownPath) =>
        parseMarkdownIssueTemplate(
          new TextDecoder().decode(Deno.readFileSync(markdownPath)),
        )
      );
      if (issueTemplates.length === 0) {
        return rejectWithValue("No templates found");
      }
      return issueTemplates;
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const editIssue = createAsyncThunk(
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
      return rejectWithValue(error);
    }
  },
);

export const createIssue = createAsyncThunk(
  "issue/create",
  async (finalIssue: Issue, { rejectWithValue }) => {
    try {
      const response = await createIssueService(
        finalIssue.title,
        finalIssue.body,
      );
      return response.url;
    } catch (error) {
      return rejectWithValue(error);
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
      } as IssueState;
    },
    submitOverview: (state, action) => {
      if (state.step === "input_overview") {
        return {
          step: "generating",
          template: state.template,
          overview: action.payload,
        } as IssueState;
      }
      return state;
    },
    setGeneratedIssues: (_state, action) => {
      return { step: "select_issue", issues: action.payload } as IssueState;
    },
    selectIssue: (_state, action) => {
      return {
        step: "edit_issue",
        selectedIssue: action.payload,
      } as IssueState;
    },
    setError: () => {
      return { step: "error" } as IssueState;
    },
    reset: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadTemplates.fulfilled, (_state, action) => {
        return {
          step: "select_template",
          templates: action.payload,
        } as IssueState;
      })
      .addCase(loadTemplates.rejected, () => {
        return { step: "error" } as IssueState;
      })
      .addCase(editIssue.fulfilled, (_state, action) => {
        return { step: "creating", finalIssue: action.payload } as IssueState;
      })
      .addCase(editIssue.rejected, () => {
        return { step: "error" } as IssueState;
      })
      .addCase(createIssue.fulfilled, (_state, action) => {
        return { step: "done", url: action.payload } as IssueState;
      })
      .addCase(createIssue.rejected, () => {
        return { step: "error" } as IssueState;
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
