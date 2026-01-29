import { Box, useInput } from "ink";
import { useEffect } from "react";
import { EditCommitMessageStatusBar } from "./StatusBar.tsx";
import { EditCommitMessageHeader } from "./Header.tsx";
import { EditCommitMessageBody } from "./Body.tsx";
import { EditCommitMessageFooter } from "./Hooter.tsx";
import { useAppDispatch, useAppSelector } from "../../../app/hooks.ts";
import {
  changeToAiMode,
  changeToNormalMode,
} from "../edit_commit_message_slice.ts";
import { runTui } from "../../../lib/tui.ts";
import { initializeDecorators } from "../domain/init_decorators.ts";

export const BORDER_WIDTH = 1 as const;
export const BORDER_PADDING = 1 as const;
export const BORDER_SIZE = BORDER_WIDTH + BORDER_PADDING * 2;
export const LABEL_WIDTH = 6 as const;
export const EDITOR_GAP = 1 as const;
export const GUTTER_WIDTH = 1 as const;
export const GUTTER_MARGIN = 1 as const;
export const GUTTER_SIZE = GUTTER_WIDTH + GUTTER_MARGIN * 2;
export const RESERVED_WIDTH = 2 as const;
export const NOT_INPUT_WIDTH = LABEL_WIDTH + BORDER_SIZE + GUTTER_SIZE +
  RESERVED_WIDTH;

export const EditCommitMessageContents = () => {
  const dispatch = useAppDispatch();
  const mode = useAppSelector((state) => state.editCommitMessage.form.mode);

  // Initialize decorators on mount
  useEffect(() => {
    initializeDecorators();
  }, []);

  useInput((input, key) => {
    if (key.ctrl && input === "g" && mode === "normal") {
      dispatch(changeToAiMode());
    }
    if (key.escape && mode === "ai") {
      dispatch(changeToNormalMode());
    }
  });

  return (
    <Box flexDirection="column">
      <EditCommitMessageStatusBar />
      <Box
        flexDirection="column"
        borderColor="cyan"
        borderStyle="round"
        rowGap={EDITOR_GAP}
        paddingX={BORDER_PADDING}
      >
        <EditCommitMessageHeader />
        <EditCommitMessageBody />
        <EditCommitMessageFooter />
      </Box>
    </Box>
  );
};

// deno-coverage-ignore-start
if (import.meta.main) {
  runTui(<EditCommitMessageContents />);
}
// deno-coverage-ignore-stop
