import type { BaseQueryFn } from "@reduxjs/toolkit/query";
import { createApi } from "@reduxjs/toolkit/query/react";
import type { AppExtraArgument } from "../app/store.ts";
import type { ConfigService } from "../services/config/config_service.ts";
import type { ConfigScope, CredentialsScope } from "../services/config/file.ts";
import type { Config } from "../services/config/schema/config.ts";
import type { Credentials } from "../services/config/schema/credentials.ts";
import type { NestedKeys, PathValue } from "../type.ts";

const configBaseQuery: BaseQueryFn<
  { method: keyof ConfigService; args?: unknown[] },
  unknown,
  { message: string }
> = async (args, api, _extraOptions) => {
  try {
    const { config } = api.extra as AppExtraArgument;
    const { method, args: methodArgs = [] } = args;

    const result = await (
      config[method] as (...args: unknown[]) => Promise<unknown>
    )(
      ...methodArgs,
    );

    return { data: result };
  } catch (error) {
    return {
      error: {
        message: error instanceof Error ? error.message : "Unknown error",
      },
    };
  }
};

export const configApi = createApi({
  reducerPath: "configApi",
  baseQuery: configBaseQuery,
  tagTypes: [
    "GlobalConfig",
    "ProjectConfig",
    "LocalConfig",
    "MergedConfig",
    "Credentials",
  ],
  endpoints: (builder) => ({
    getGlobalConfig: builder.query<
      {
        config: Partial<Config> | undefined;
        credentials: Partial<Credentials> | undefined;
      },
      void
    >({
      query: () => ({ method: "getGlobalConfig" }),
      providesTags: ["GlobalConfig"],
    }),
    getProjectConfig: builder.query<Partial<Config> | undefined, void>({
      query: () => ({ method: "getProjectConfig" }),
      providesTags: ["ProjectConfig"],
    }),
    getLocalConfig: builder.query<
      {
        config: Partial<Config> | undefined;
        credentials: Partial<Credentials> | undefined;
      },
      void
    >({
      query: () => ({ method: "getLocalConfig" }),
      providesTags: ["LocalConfig"],
    }),
    getMergedConfig: builder.query<Config, void>({
      query: () => ({ method: "getMergedConfig" }),
      providesTags: ["MergedConfig"],
    }),
    getMergedCredentials: builder.query<Partial<Credentials>, void>({
      query: () => ({ method: "getMergedCredentials" }),
      providesTags: ["Credentials"],
    }),
    saveConfig: builder.mutation<
      void,
      {
        scope: ConfigScope;
        key: NestedKeys<Config>;
        value: PathValue<Config, NestedKeys<Config>>;
      }
    >({
      query: ({ scope, key, value }) => ({
        method: "saveConfig",
        args: [scope, key, value],
      }),
      invalidatesTags: [
        "GlobalConfig",
        "ProjectConfig",
        "LocalConfig",
        "MergedConfig",
      ],
    }),
    saveCredentials: builder.mutation<
      void,
      {
        scope: CredentialsScope;
        key: NestedKeys<Credentials>;
        value: PathValue<Credentials, NestedKeys<Credentials>>;
      }
    >({
      query: ({ scope, key, value }) => ({
        method: "saveCredentials",
        args: [scope, key, value],
      }),
      invalidatesTags: ["GlobalConfig", "LocalConfig", "Credentials"],
    }),
  }),
});

export const {
  useGetGlobalConfigQuery,
  useGetProjectConfigQuery,
  useGetLocalConfigQuery,
  useGetMergedConfigQuery,
  useGetMergedCredentialsQuery,
  useSaveConfigMutation,
  useSaveCredentialsMutation,
} = configApi;
