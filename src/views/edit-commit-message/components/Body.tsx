import { Box, Text, useInput } from "ink";
import { useAppDispatch, useAppSelector } from "../../../app/hooks.ts";
import {
  focusFooter,
  focusHeader,
} from "../editCommitMessageSlice.ts";
import { LABEL_WIDTH } from "./Contents.tsx";

export const EditCommitMessageBody = () => {
  const dispatch = useAppDispatch();
  const focus = useAppSelector((state) => state.editCommitMessage.form.focus);
  const isFocused = focus === "body";

  useInput((_input, key) => {
    if (isFocused) {
      if (key.downArrow) {
        dispatch(focusFooter());
      }
      if (key.upArrow) {
        dispatch(focusHeader());
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
        <Text></Text>
      </Box>
    </Box>
  );
};
