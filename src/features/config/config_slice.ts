import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { createAppAsyncThunk } from "../../app/hooks.ts";
import { fromPromiseWithMessage } from "../../helpers/error/neverthrow.ts";
import type { ConfigScope } from "../../services/config/config_file.ts";
import { ConfigSchema, type Config } from "../../services/config/schema/config_schema.ts";
import type { GlobalConfig } from "../../services/config/schema/global_config_schema.ts";
import type { LocalConfig } from "../../services/config/schema/local_config_schema.ts";
import type { ProjectConfig } from "../../services/config/schema/project_config_schema.ts";
import type { NestedKeys, PathValue } from "../../type.ts";

type ConfigState = {
  mergedConfig: Config;
  globalConfig: Partial<GlobalConfig>;
  localConfig: Partial<LocalConfig>;
  projectConfig: Partial<ProjectConfig>;
};

const initialState: ConfigState = {
  mergedConfig: ConfigSchema.parse({}),
  globalConfig: {},
  localConfig: {},
  projectConfig: {},
};

type SetConfigPayload = {
  mergedConfig: Config;
  globalConfig?: Partial<GlobalConfig>;
  localConfig?: Partial<LocalConfig>;
  projectConfig?: Partial<ProjectConfig>;
};

type SetConfigThunkConfig = {
  rejectValue: string;
};

export const setConfig = createAppAsyncThunk<
  SetConfigPayload,
  {
    scope: ConfigScope;
    key: NestedKeys<Config>;
    value: PathValue<Config, NestedKeys<Config>>;
  },
  SetConfigThunkConfig
>(
  "Config/setGlobalConfig",
  async ({ scope, key, value }, { extra, rejectWithValue }) => {
    return fromPromiseWithMessage((async () => {
      await extra.config.saveConfig(scope, key, value);
      const mergedConfig = await extra.config.getMergedConfig();

      switch (scope) {
        case "global":
          return { globalConfig: await extra.config.getGlobalConfig(), mergedConfig };
        case "local":
          return { localConfig: await extra.config.getLocalConfig(), mergedConfig };
        case "project":
          return { projectConfig: await extra.config.getProjectConfig(), mergedConfig };
      }
    })()).match((result) => result, rejectWithValue);
  },
);

const configSlice = createSlice({
  name: "Config",
  initialState,
  reducers: {
    setMergedConfig: (state, action: PayloadAction<Config>) => {
      state.mergedConfig = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(setConfig.fulfilled, (state, action) => {
        if (action.payload.globalConfig) state.globalConfig = action.payload.globalConfig;
        if (action.payload.localConfig) state.localConfig = action.payload.localConfig;
        if (action.payload.projectConfig) state.projectConfig = action.payload.projectConfig;
        state.mergedConfig = action.payload.mergedConfig;
      })
      .addCase(setConfig.rejected, (_state, _action) => {})
      .addCase(setConfig.pending, (_state, _action) => {});
  },
});

export const { setMergedConfig } = configSlice.actions;
export const configReducer = configSlice.reducer;
