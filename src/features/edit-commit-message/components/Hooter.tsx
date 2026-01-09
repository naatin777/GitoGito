import { Box, Text, useInput } from "ink";
import { useAppDispatch, useAppSelector } from "../../../store/hooks.ts";
import {
  focusBody,
  focusHeader,
} from "../../../store/slices/editCommitMessageSlice.ts";
import { LABEL_WIDTH } from "./Contents.tsx";

export const EditCommitMessageFooter = () => {
  const dispatch = useAppDispatch();
  const focus = useAppSelector((state) => state.editCommitMessage.form.focus);
  const isFocused = focus === "footer";

  useInput((_input, key) => {
    if (isFocused) {
      if (key.downArrow) {
        dispatch(focusHeader());
      }
      if (key.upArrow) {
        dispatch(focusBody());
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
        <Text></Text>
      </Box>
    </Box>
  );
};
