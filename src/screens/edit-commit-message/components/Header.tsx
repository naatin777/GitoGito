import { Box, Text, useInput, useStdout } from "ink";
import { useAppDispatch, useAppSelector } from "../../../store/hooks.ts";
import {
  focusBody,
  focusFooter,
  headerCursorLeft,
  headerCursorRight,
  headerDelete,
  headerGoToEnd,
  headerGoToStart,
  headerSuggestionAccept,
  headerSuggestionCancel,
  headerSuggestionNext,
  headerSuggestionPrev,
  headerType,
} from "../../../store/slices/editCommitMessageSlice.ts";
import { splitTextToLines } from "../../../helpers/text/split-text-to-lines.ts";
import { EditCommitMessageLine } from "./Line.tsx";
import {
  GUTTER_MARGIN,
  GUTTER_WIDTH,
  LABEL_WIDTH,
  NOT_INPUT_WIDTH,
} from "./Contents.tsx";

export const EditCommitMessageHeader = () => {
  const dispatch = useAppDispatch();
  const form = useAppSelector((state) => state.editCommitMessage.form);
  const header = useAppSelector((state) => state.editCommitMessage.header);
  const isFocused = form.focus === "header";
  const isAiMode = form.mode === "ai";
  const { stdout } = useStdout();
  const inputWidth = stdout.columns - NOT_INPUT_WIDTH;
  const lines = splitTextToLines(header.value, inputWidth);

  useInput((input, key) => {
    if (isFocused) {
      if (key.tab && !key.shift) {
        dispatch(headerSuggestionNext());
      } else if (key.tab && key.shift) {
        dispatch(headerSuggestionPrev());
      }
      if (!key.ctrl && !key.meta) {
        if (!key.return || !(input === "\r")) {
          dispatch(headerType({ char: input }));
        }
      }
      if (key.backspace || key.delete) {
        dispatch(headerDelete());
      }
      if (header.suggestionIndex === undefined) {
        if (key.leftArrow) dispatch(headerCursorLeft());
        else if (key.rightArrow) dispatch(headerCursorRight());
        else if (key.downArrow) dispatch(focusBody());
        else if (key.upArrow) dispatch(focusFooter());
        else if (key.ctrl && input === "a") {
          dispatch(headerGoToStart());
        } else if (key.ctrl && input === "e") {
          dispatch(headerGoToEnd());
        } else if (key.return || (input === "\r")) {
          dispatch(focusBody());
        }
      } else {
        if (key.return || input === "\r") {
          dispatch(headerSuggestionAccept());
        } else if (key.escape) {
          dispatch(headerSuggestionCancel());
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
              cursor={header.cursor}
              isFocused={isFocused}
              isAiMode={isAiMode}
            />
          </Box>
        ))}
        <Box flexDirection="column">
          {isFocused &&
            header.filteredSuggestion.map((suggestion, index) => (
              <Box key={index} flexDirection="row">
                <Box width={1} marginX={1}>
                  <Text
                    color={header.suggestionIndex === index
                      ? "green"
                      : undefined}
                  >
                    {`→`}
                  </Text>
                </Box>
                <Text
                  color="green"
                  inverse={header.suggestionIndex === index}
                >
                  {header.value}
                </Text>
                <Text
                  color="blue"
                  inverse={header.suggestionIndex === index}
                >
                  {`${suggestion.value.slice(header.value.length)}`}
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
