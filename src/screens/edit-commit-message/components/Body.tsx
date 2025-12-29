import { Box, Text, useInput } from "ink";
import { useEditCommitMessageStore } from "../state/context.tsx";

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
      <Box width={7}>
        <Text color={isFocused ? "green" : undefined} bold>Body</Text>
      </Box>
      <Box width={2}>
        <Text color={isFocused ? "green" : undefined}>
          {isFocused ? `❯ ` : `│ `}
        </Text>
      </Box>
      <Box>
        <Text>{"aaaa"}</Text>
      </Box>
    </Box>
  );
};
