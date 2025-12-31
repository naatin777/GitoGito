import { Box, Text, useInput } from "ink";
import { useEditCommitMessageStore } from "../state/context.tsx";
import { LABEL_WIDTH } from "./Contents.tsx";

export const EditCommitMessageBody = () => {
  const { state, dispatch } = useEditCommitMessageStore();
  const isFocused = state.form.focus === "body";

  useInput((_input, key) => {
    if (isFocused) {
      if (key.downArrow) {
        dispatch({ type: "FOCUS_FOOTER" });
      }
      if (key.upArrow) {
        dispatch({ type: "FOCUS_HEADER" });
      }
    }
  });

  return (
    <Box flexDirection="row">
      <Box width={LABEL_WIDTH} flexDirection="column">
        <Text color={isFocused ? "green" : undefined} bold>Body</Text>
      </Box>
      <Box width={1} marginX={1}>
        <Text color={isFocused ? "green" : undefined}>
          {isFocused ? `❯` : `│`}
        </Text>
      </Box>
      <Box>
        <Text>{""}</Text>
      </Box>
    </Box>
  );
};
