import { createSlice } from "@reduxjs/toolkit";
import { errAsync, okAsync } from "neverthrow";
import type z from "zod";
import { createAppAsyncThunk } from "../../app/hooks.ts";
import { COMMIT_SYSTEM_MESSAGE } from "../../constants/message.ts";
import { fromPromiseWithMessage } from "../../helpers/error/neverthrow.ts";
import { CommitSchema } from "../../schema.ts";
import { AIService } from "../../services/ai/ai_service.ts";
import { editText } from "../../services/editor/edit_text.ts";
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

type CommitThunkConfig = {
  rejectValue: string;
};

// Async thunks for side effects
export const generateCommitMessages = createAppAsyncThunk<
  z.infer<typeof CommitSchema>,
  void,
  CommitThunkConfig
>(
  "commit/generate",
  async (_, { rejectWithValue, extra }) => {
    const gitService = new GitService();

    return fromPromiseWithMessage(gitService.diff.getGitDiffStaged())
      .andThen((diff) => diff ? okAsync(diff) : errAsync("No diff found"))
      .andThen((diff) =>
        fromPromiseWithMessage(
          AIService.create(extra.config, extra.credentials),
        )
          .andThen((aiService) =>
            fromPromiseWithMessage(
              aiService.generateStructuredOutput(
                [
                  { role: "system", content: COMMIT_SYSTEM_MESSAGE },
                  { role: "user", content: diff },
                ],
                COMMIT_SYSTEM_MESSAGE,
                CommitSchema,
                (_usage) => {
                },
              ),
            )
          )
      )
      .andThen((result) =>
        result ? okAsync(result) : errAsync("AI generation failed")
      )
      .match((result) => result, rejectWithValue);
  },
);

export const editCommitMessage = createAppAsyncThunk<
  string,
  z.infer<typeof CommitSchema>["commit_message"][number],
  CommitThunkConfig
>(
  "commit/edit",
  async (
    selectedMessage: z.infer<typeof CommitSchema>["commit_message"][number],
    { rejectWithValue },
  ) => {
    const combinedMessage = [
      selectedMessage.header,
      selectedMessage.body,
      selectedMessage.footer,
    ].filter(Boolean).join("\n\n");

    return fromPromiseWithMessage(editText(combinedMessage))
      .andThen((edited) => edited.trim() ? okAsync(edited) : errAsync("Empty message"))
      .match((edited) => edited, rejectWithValue);
  },
);

export const commitMessage = createAppAsyncThunk<boolean, string, CommitThunkConfig>(
  "commit/commit",
  async (message: string, { rejectWithValue }) => {
    const gitService = new GitService();

    return fromPromiseWithMessage(
      gitService.commit.commitWithMessages([message]).then(() => true),
    ).match((result) => result, rejectWithValue);
  },
);

// Slice definition
const commitSlice = createSlice({
  name: "commit",
  initialState,
  reducers: {
    selectMessage: (_state, action) => {
      return { step: "edit", selectedMessage: action.payload };
    },
    reset: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Generate messages
      .addCase(generateCommitMessages.fulfilled, (_state, action) => {
        return { step: "select", messages: action.payload };
      })
      .addCase(generateCommitMessages.rejected, (_state, action) => {
        return {
          step: "error",
          message: String(action.payload || "Unknown error"),
        };
      })
      // Edit message
      .addCase(editCommitMessage.fulfilled, (_state, action) => {
        return {
          step: "commit",
          commitMessage: action.payload,
        };
      })
      .addCase(editCommitMessage.rejected, (_state, action) => {
        return {
          step: "error",
          message: String(action.payload || "Unknown error"),
        };
      })
      // Commit
      .addCase(commitMessage.fulfilled, () => {
        return { step: "done" };
      })
      .addCase(commitMessage.rejected, (_state, action) => {
        return {
          step: "error",
          message: String(action.payload || "Unknown error"),
        };
      });
  },
});

export const { selectMessage, reset } = commitSlice.actions;
export const commitReducer = commitSlice.reducer;
