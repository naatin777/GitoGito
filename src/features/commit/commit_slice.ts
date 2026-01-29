import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type z from "zod";
import { COMMIT_SYSTEM_MESSAGE } from "../../constants/message.ts";
import { CommitSchema } from "../../schema.ts";
import { AIService } from "../../services/ai.ts";
import { editText } from "../../services/editor.ts";
import { GitService } from "../../services/git/git_service.ts";

// State type preserved from current reducer
export type CommitState =
  | { step: "loading" }
  | { step: "select"; messages: z.infer<typeof CommitSchema> }
  | {
    step: "edit";
    selectedMessage: z.infer<typeof CommitSchema>["commit_message"][number];
  }
  | { step: "commit"; commitMessage: string }
  | { step: "done" }
  | { step: "error"; message: string };

const initialState: CommitState = { step: "loading" } as CommitState;

// Async thunks for side effects
export const generateCommitMessages = createAsyncThunk(
  "commit/generate",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const gitService = new GitService();
      const diff = await gitService.diff.getGitDiffStaged();
      if (!diff) return rejectWithValue("No diff found");

      const aiService = await AIService.create();

      // Initialize context usage tracking

      const result = await aiService.generateStructuredOutput(
        [
          { role: "system", content: COMMIT_SYSTEM_MESSAGE },
          { role: "user", content: diff },
        ],
        COMMIT_SYSTEM_MESSAGE,
        CommitSchema,
        (usage) => {
        },
      );

      if (!result) return rejectWithValue("AI generation failed");
      return result;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : String(error),
      );
    }
  },
);

export const editCommitMessage = createAsyncThunk(
  "commit/edit",
  async (
    selectedMessage: z.infer<typeof CommitSchema>["commit_message"][number],
    { rejectWithValue },
  ) => {
    try {
      const combinedMessage = [
        selectedMessage.header,
        selectedMessage.body,
        selectedMessage.footer,
      ].filter(Boolean).join("\n\n");

      const edited = await editText(combinedMessage);
      if (!edited.trim()) return rejectWithValue("Empty message");
      return edited;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : String(error),
      );
    }
  },
);

export const commitMessage = createAsyncThunk(
  "commit/commit",
  async (message: string, { rejectWithValue }) => {
    try {
      const gitService = new GitService();
      await gitService.commit.commitWithMessages([message]);
      return true;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : String(error),
      );
    }
  },
);

// Slice definition
const commitSlice = createSlice({
  name: "commit",
  initialState,
  reducers: {
    selectMessage: (_state, action) => {
      return { step: "edit", selectedMessage: action.payload } as CommitState;
    },
    reset: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Generate messages
      .addCase(generateCommitMessages.fulfilled, (_state, action) => {
        return { step: "select", messages: action.payload } as CommitState;
      })
      .addCase(generateCommitMessages.rejected, (_state, action) => {
        return {
          step: "error",
          message: String(action.payload || "Unknown error"),
        } as CommitState;
      })
      // Edit message
      .addCase(editCommitMessage.fulfilled, (_state, action) => {
        return {
          step: "commit",
          commitMessage: action.payload,
        } as CommitState;
      })
      .addCase(editCommitMessage.rejected, (_state, action) => {
        return {
          step: "error",
          message: String(action.payload || "Unknown error"),
        } as CommitState;
      })
      // Commit
      .addCase(commitMessage.fulfilled, () => {
        return { step: "done" } as CommitState;
      })
      .addCase(commitMessage.rejected, (_state, action) => {
        return {
          step: "error",
          message: String(action.payload || "Unknown error"),
        } as CommitState;
      });
  },
});

export const { selectMessage, reset } = commitSlice.actions;
export const commitReducer = commitSlice.reducer;
