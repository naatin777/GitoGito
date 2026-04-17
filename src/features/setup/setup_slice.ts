import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { createAppAsyncThunk } from "../../app/hooks.ts";
import { fromPromiseWithMessage } from "../../helpers/error/neverthrow.ts";
import type { AiModel } from "../../services/config/schema/fields/ai_schema.ts";
import { DEFAULT_AI_MODEL } from "../../services/config/schema/fields/ai_schema.ts";
import type { ThemeConfig } from "../../services/config/schema/fields/theme_schema.ts";

export type SetupData = {
  provider: AiModel["provider"];
  model: string;
  openRouterApiKey: string;
  geminiApiKey: string;
  githubToken: string;
  language: string;
  themeMode: ThemeConfig["mode"];
};

export type SetupState = SetupData & {
  status: "idle" | "saving" | "done" | "error";
  error: string | null;
};

const initialState: SetupState = {
  provider: DEFAULT_AI_MODEL.provider,
  model: DEFAULT_AI_MODEL.model,
  openRouterApiKey: "",
  geminiApiKey: "",
  githubToken: "",
  language: "English",
  themeMode: "SolidDark",
  status: "idle",
  error: null,
};

type SetupThunkConfig = {
  rejectValue: string;
};

export const saveSetup = createAppAsyncThunk<void, SetupData, SetupThunkConfig>(
  "setup/save",
  async (data: SetupData, { extra, rejectWithValue }) => {
    const { config, credentials } = extra;
    return fromPromiseWithMessage((async () => {
      await config.saveConfig("global", "ai.default.provider", data.provider);
      await config.saveConfig("global", "ai.default.model", data.model);
      await config.saveConfig("global", "language.dialogue", data.language);
      await config.saveConfig("global", "language.output", data.language);
      await config.saveConfig("global", "theme.mode", data.themeMode);
      if (data.openRouterApiKey) {
        await credentials.saveCredentials("global", "openRouterApiKey", data.openRouterApiKey);
      }
      if (data.geminiApiKey) {
        await credentials.saveCredentials("global", "geminiApiKey", data.geminiApiKey);
      }
      if (data.githubToken) {
        await credentials.saveCredentials("global", "githubToken", data.githubToken);
      }
    })()).match(() => undefined, rejectWithValue);
  },
);

const setupSlice = createSlice({
  name: "setup",
  initialState,
  reducers: {
    setProvider(state, action: PayloadAction<AiModel["provider"]>) {
      state.provider = action.payload;
      state.openRouterApiKey = "";
      state.geminiApiKey = "";
    },
    setModel(state, action: PayloadAction<string>) {
      state.model = action.payload;
    },
    setOpenRouterApiKey(state, action: PayloadAction<string>) {
      state.openRouterApiKey = action.payload;
    },
    setGeminiApiKey(state, action: PayloadAction<string>) {
      state.geminiApiKey = action.payload;
    },
    setGithubToken(state, action: PayloadAction<string>) {
      state.githubToken = action.payload;
    },
    setLanguage(state, action: PayloadAction<string>) {
      state.language = action.payload;
    },
    setThemeMode(state, action: PayloadAction<ThemeConfig["mode"]>) {
      state.themeMode = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(saveSetup.pending, (state) => {
        state.status = "saving";
        state.error = null;
      })
      .addCase(saveSetup.fulfilled, (state) => {
        state.status = "done";
      })
      .addCase(saveSetup.rejected, (state, action) => {
        state.status = "error";
        state.error = action.payload ?? "Failed to save setup.";
      });
  },
});

export const {
  setProvider,
  setModel,
  setOpenRouterApiKey,
  setGeminiApiKey,
  setGithubToken,
  setLanguage,
  setThemeMode,
} = setupSlice.actions;

export const setupReducer = setupSlice.reducer;
