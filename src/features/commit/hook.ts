import { useEffect } from "react";
import { useApp } from "ink";
import { useAppDispatch, useAppSelector } from "../../store/hooks.ts";
import {
  generateCommitMessages,
  editCommitMessage,
  commitMessage,
  selectMessage,
} from "../../store/slices/commitSlice.ts";

export function useCommitFlow() {
  const dispatch = useAppDispatch();
  const state = useAppSelector((state) => state.commit);
  const { exit } = useApp();

  useEffect(() => {
    if (state.step === "done" || state.step === "error") {
      exit();
    }
  }, [state.step, exit]);

  return {
    state,
    generateCommitMessages: async () => {
      await dispatch(generateCommitMessages());
    },
    selectCommitMessage: (
      message:
        | {
          header: string;
          body: string | null;
          footer: string | null;
        }
        | undefined,
    ) => {
      if (message) {
        dispatch(selectMessage(message));
      }
    },
    editCommitMessage: async () => {
      if (state.step === "edit") {
        await dispatch(editCommitMessage(state.selectedMessage));
      }
    },
    commitMessage: async () => {
      if (state.step === "commit") {
        await dispatch(commitMessage(state.commitMessage));
      }
    },
  };
}
