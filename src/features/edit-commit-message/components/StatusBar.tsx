import { Box, Text } from "ink";
import { useAppSelector } from "../../../store/hooks.ts";
import {
  AI_MODE_SHORTCUTS,
  NORMAL_MODE_SHORTCUTS,
} from "../../../constants/shortcuts.ts";
import { runTui } from "../../../lib/tui.ts";

export const EditCommitMessageStatusBar = () => {
  const mode = useAppSelector((state) => state.editCommitMessage.form.mode);

  const shortcuts = mode === "normal"
    ? NORMAL_MODE_SHORTCUTS
    : AI_MODE_SHORTCUTS;

  return (
    <Box flexDirection="row" justifyContent="space-between" paddingX={1}>
      <Box flexDirection="row" justifyContent="flex-start">
        <Text bold>Please write a commit message</Text>
      </Box>
      <Box flexDirection="row" justifyContent="flex-end" gap={2}>
        {shortcuts.map((shortcut) => (
          <Box key={shortcut.key}>
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
  runTui(<EditCommitMessageStatusBar />);
}
// deno-coverage-ignore-stop
