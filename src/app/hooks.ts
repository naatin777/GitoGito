import { createAsyncThunk } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import type { GitRemoteRepository } from "../services/git/remote_repository.ts";
import type { AppDispatch, RootState } from "./store.ts";

// Pre-typed hooks for TypeScript
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
export const createAppAsyncThunk = createAsyncThunk.withTypes<{
  state: RootState;
  dispatch: AppDispatch;
  extra: { git: GitRemoteRepository };
}>();
