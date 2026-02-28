import { useRenderer } from "@opentui/react";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks.ts";
import {
  commitMessage,
  editCommitMessage,
  generateCommitMessages,
  selectMessage,
} from "./commit_slice.ts";

export function useCommitFlow() {
  const dispatch = useAppDispatch();
  const state = useAppSelector((state) => state.commit);
  const renderer = useRenderer();

  useEffect(() => {
    if (state.step === "done" || state.step === "error") {
      renderer.destroy();
    }
  }, [state.step, renderer]);

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
