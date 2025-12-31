import { Box, Text, useInput } from "ink";
import { useEditCommitMessageStore } from "../state/context.tsx";
import { LABEL_WIDTH } from "./Contents.tsx";

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
      <Box width={LABEL_WIDTH} flexDirection="column">
        <Text color={isFocused ? "green" : undefined} bold>Footer</Text>
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
