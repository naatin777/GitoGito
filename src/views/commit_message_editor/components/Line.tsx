import { Box, Text } from "ink";
import type { Line } from "../../../helpers/text/split_text_to_lines.ts";

interface LineProps {
  line: Line;
  cursor: number;
  isFocused: boolean;
  isAiMode: boolean;
}

export const EditCommitMessageLine = (
  { line, cursor, isFocused, isAiMode }: LineProps,
) => {
  const isCursorInThisLine = cursor >= line.start &&
    cursor <= line.start + line.text.length;

  if (!isCursorInThisLine) {
    return (
      <Box>
        <Text>{line.text}</Text>
      </Box>
    );
  }

  const localCursorIndex = cursor - line.start;
  const before = line.text.slice(0, localCursorIndex);
  const current = line.text[localCursorIndex];
  const after = line.text.slice(localCursorIndex + 1);

  return (
    <Box>
      <Text>
        {before}
        {current
          ? <Text inverse={isFocused && !isAiMode}>{current}</Text>
          : <Text inverse={isFocused && !isAiMode}>{` `}</Text>}
        {after}
      </Text>
    </Box>
  );
};
