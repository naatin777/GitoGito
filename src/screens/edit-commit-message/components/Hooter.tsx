import { Box, Text, useInput } from "ink";
import { useEditCommitMessageStore } from "../state/context.tsx";

export const EditCommitMessageFooter = () => {
  const { state, dispatch } = useEditCommitMessageStore();
  const isFocused = state.form.focus === "footer";

  useInput((_input, key) => {
    if (isFocused) {
      if (key.downArrow) {
        dispatch({ type: "FOCUS_HEADER" });
      }
      if (key.upArrow) {
        dispatch({ type: "FOCUS_BODY" });
      }
    }
  });

  return (
    <Box
      flexDirection="row"
      borderColor={isFocused ? "green" : undefined}
    >
      <Box width={7}>
        <Text color={isFocused ? "green" : undefined} bold>Footer</Text>
      </Box>
      <Box width={2}>
        <Text color={isFocused ? "green" : undefined}>
          {isFocused ? `❯ ` : `│ `}
        </Text>
      </Box>
      <Box>
        <Text>{"aaaaaaaa"}</Text>
      </Box>
    </Box>
  );
};
