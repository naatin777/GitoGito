import { Box, Text, useInput, useStdout } from "ink";
import { useEditCommitMessageStore } from "../state/context.tsx";
import { splitTextToLines } from "../../../utils/split-text-to-lines.ts";
import { EditCommitMessageLine } from "./Line.tsx";

export const EditCommitMessageHeader = () => {
  const { state, dispatch } = useEditCommitMessageStore();
  const isFocused = state.form.focus === "header";
  const isAiMode = state.form.mode === "ai";

  const { stdout } = useStdout();
  const labelWidth = 7;
  const separatorWidth = 2;
  const inputWidth = stdout.columns - labelWidth - separatorWidth - 4;
  const lines = splitTextToLines(state.header.value, inputWidth);

  useInput((input, key) => {
    if (isFocused) {
      if (key.leftArrow) dispatch({ type: "CURSOR_LEFT" });
      else if (key.rightArrow) dispatch({ type: "CURSOR_RIGHT" });
      else if (key.downArrow) dispatch({ type: "FOCUS_BODY" });
      else if (key.upArrow) dispatch({ type: "FOCUS_FOOTER" });
      else if (key.backspace || key.delete) dispatch({ type: "DELETE" });
      else if (key.ctrl && input === "a") dispatch({ type: "GO_TO_START" });
      else if (key.ctrl && input === "e") dispatch({ type: "GO_TO_END" });
      else if (!key.ctrl && !key.meta) {
        if (!key.return) dispatch({ type: "TYPE", char: input });
        else dispatch({ type: "FOCUS_BODY" });
      }
    }
  });

  return (
    <Box flexDirection="row">
      <Box width={labelWidth}>
        <Text color={isFocused ? "green" : undefined} bold>Header</Text>
      </Box>
      <Box flexDirection="column">
        {lines.map((line, index) => (
          <Box key={`${line.start}-${line.text}`} flexDirection="row">
            <Box width={separatorWidth}>
              <Text color={isFocused ? "green" : undefined}>
                {isFocused ? index === 0 ? `❯ ` : " " : `│ `}
              </Text>
            </Box>
            <EditCommitMessageLine
              line={line}
              cursor={state.header.cursor}
              isFocused={isFocused}
              isAiMode={isAiMode}
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
};
