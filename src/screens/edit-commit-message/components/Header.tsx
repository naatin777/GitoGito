import { Box, Text, useInput, useStdout } from "ink";
import { useEditCommitMessageStore } from "../state/context.tsx";
import { splitTextToLines } from "../../../utils/split-text-to-lines.ts";
import { EditCommitMessageLine } from "./Line.tsx";
import {
  GUTTER_MARGIN,
  GUTTER_WIDTH,
  LABEL_WIDTH,
  NOT_INPUT_WIDTH,
} from "./Contents.tsx";

export const EditCommitMessageHeader = () => {
  const { state, dispatch } = useEditCommitMessageStore();
  const isFocused = state.form.focus === "header";
  const isAiMode = state.form.mode === "ai";
  const { stdout } = useStdout();
  const inputWidth = stdout.columns - NOT_INPUT_WIDTH;
  const lines = splitTextToLines(state.header.value, inputWidth);

  useInput((input, key) => {
    if (isFocused) {
      if (key.tab && !key.shift) {
        dispatch({ type: "HEADER_SUGGESTION_NEXT" });
      } else if (key.tab && key.shift) {
        dispatch({ type: "HEADER_SUGGESTION_PREV" });
      }
      if (!key.ctrl && !key.meta) {
        if (!key.return || !(input === "\r")) {
          dispatch({ type: "HEADER_TYPE", char: input });
        }
      }
      if (key.backspace || key.delete) {
        dispatch({ type: "HEADER_DELETE" });
      }
      if (state.header.suggestionIndex === undefined) {
        if (key.leftArrow) dispatch({ type: "HEADER_CURSOR_LEFT" });
        else if (key.rightArrow) dispatch({ type: "HEADER_CURSOR_RIGHT" });
        else if (key.downArrow) dispatch({ type: "FOCUS_BODY" });
        else if (key.upArrow) dispatch({ type: "FOCUS_FOOTER" });
        else if (key.ctrl && input === "a") {
          dispatch({ type: "HEADER_GO_TO_START" });
        } else if (key.ctrl && input === "e") {
          dispatch({ type: "HEADER_GO_TO_END" });
        } else if (key.return || (input === "\r")) {
          dispatch({ type: "FOCUS_BODY" });
        }
      } else {
        if (key.return || input === "\r") {
          dispatch({ type: "HEADER_SUGGESTION_ACCEPT" });
        } else if (key.escape) {
          dispatch({ type: "HEADER_SUGGESTION_CANCEL" });
        }
      }
    }
  });

  return (
    <Box flexDirection="row">
      <Box width={LABEL_WIDTH} flexDirection="column">
        <Text color={isFocused ? "green" : undefined} bold>
          Header
        </Text>
      </Box>
      <Box flexDirection="column">
        {lines.map((line, index) => (
          <Box key={`${line.start}-${line.text}`} flexDirection="row">
            <Box width={GUTTER_WIDTH} marginX={GUTTER_MARGIN}>
              <Text color={isFocused ? "green" : undefined}>
                {isFocused ? index === 0 ? `❯` : ` ` : `│`}
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
        <Box flexDirection="column">
          {isFocused &&
            state.header.filteredSuggestion.map((suggestion, index) => (
              <Box key={index} flexDirection="row">
                <Box width={1} marginX={1}>
                  <Text
                    color={state.header.suggestionIndex === index
                      ? "green"
                      : undefined}
                  >
                    {`→`}
                  </Text>
                </Box>
                <Text
                  color="green"
                  inverse={state.header.suggestionIndex === index}
                >
                  {state.header.value}
                </Text>
                <Text
                  color="blue"
                  inverse={state.header.suggestionIndex === index}
                >
                  {`${suggestion.value.slice(state.header.value.length)}`}
                </Text>
                <Text
                  wrap="truncate"
                  color="gray"
                >
                  {` - ${suggestion.description}`}
                </Text>
              </Box>
            ))}
        </Box>
      </Box>
    </Box>
  );
};
