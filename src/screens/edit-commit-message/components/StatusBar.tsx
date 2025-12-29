import { Box, render, Text } from "ink";
import {
  EditCommitMessageProvider,
  useEditCommitMessageStore,
} from "../state/context.tsx";
import {
  AI_MODE_SHORTCUTS,
  NORMAL_MODE_SHORTCUTS,
} from "../../../constants/shortcuts.ts";

export const EditCommitMessageStatusBar = () => {
  const { state } = useEditCommitMessageStore();

  const shortcuts = state.form.mode === "normal"
    ? NORMAL_MODE_SHORTCUTS
    : AI_MODE_SHORTCUTS;

  return (
    <Box flexDirection="row" justifyContent="space-between" paddingX={1}>
      <Box flexDirection="row" justifyContent="flex-start">
        <Text bold>Please write a commit message</Text>
      </Box>
      <Box flexDirection="row" justifyContent="flex-end">
        {shortcuts.map((shortcut) => (
          <Box key={shortcut.key} paddingX={1}>
            <Text color="gray">[{shortcut.key}]</Text>
            <Text color="gray">{shortcut.description}</Text>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

// deno-coverage-ignore-start
if (import.meta.main) {
  render(
    <EditCommitMessageProvider>
      <EditCommitMessageStatusBar />
    </EditCommitMessageProvider>,
  );
}
// deno-coverage-ignore-stop
