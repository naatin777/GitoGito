import { Box, render, Text, useInput } from "ink";
import { EditCommitMessageStatusBar } from "./StatusBar.tsx";
import { EditCommitMessageHeader } from "./Header.tsx";
import { EditCommitMessageBody } from "./Body.tsx";
import { EditCommitMessageFooter } from "./Hooter.tsx";
import {
  EditCommitMessageProvider,
  useEditCommitMessageStore,
} from "../state/context.tsx";

export const EditCommitMessageContents = () => {
  const { state, dispatch } = useEditCommitMessageStore();
  useInput((input, key) => {
    if (key.ctrl && input === "g" && state.form.mode === "normal") {
      dispatch({ type: "CHANGE_TO_AI_MODE" });
    }
    if (key.escape && state.form.mode === "ai") {
      dispatch({ type: "CHANGE_TO_NORMAL_MODE" });
    }
  });

  return (
    <Box height="100%" flexDirection="column">
      <EditCommitMessageStatusBar />
      <Box
        flexDirection="column"
        borderColor="cyan"
        borderStyle="round"
        paddingX={1}
        gap={1}
      >
        <EditCommitMessageHeader />
        <EditCommitMessageBody />
        <EditCommitMessageFooter />
      </Box>
    </Box>
  );
};

const encoder = new TextEncoder();
const write = (txt: string) => Deno.stdout.writeSync(encoder.encode(txt));
const ENTER_ALT_SCREEN = "\x1b[?1049h\x1b[2J\x1b[H";
const EXIT_ALT_SCREEN = "\x1b[?1049l";
// deno-coverage-ignore-start
if (import.meta.main) {
  write(ENTER_ALT_SCREEN);

  try {
    const instance = render(
      <EditCommitMessageProvider>
        <EditCommitMessageContents />
      </EditCommitMessageProvider>,
    );

    await instance.waitUntilExit();
  } catch (err) {
    console.error(err);
  } finally {
    write(EXIT_ALT_SCREEN);
  }
}
// deno-coverage-ignore-stop
