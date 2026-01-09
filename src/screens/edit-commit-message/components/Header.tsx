/**
 * EditCommitMessageHeader component
 *
 * Displays and handles the commit message header (first line) with:
 * - Autocomplete suggestions for commit types (feat, fix, etc.)
 * - Decorator support for prefixes/suffixes (e.g., issue numbers)
 * - Multi-line text wrapping
 * - Keyboard navigation and editing
 *
 * Key Features:
 * - Tab: cycle through autocomplete suggestions
 * - Arrow keys: navigate cursor, move between sections
 * - Ctrl+A/E: jump to start/end of line
 * - Return: accept suggestion or move to body
 * - Escape: cancel suggestion selection
 */

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
import { DecoratedText } from "./DecoratedText.tsx";
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

  // Display text: use decorated message if available, otherwise use raw value
  // - Decorated: includes prefixes (e.g., "[#123] ") before user text
  // - Raw: just the user's input (e.g., "feat: add feature")
  const displayText = header.decorated
    ? header.decorated.fullText
    : header.value;
  const lines = splitTextToLines(displayText, inputWidth);

  // Calculate absolute cursor position in the full display text
  // - For decorated messages: prefix length + cursor position in user text
  // - For non-decorated: just cursor position (prefix length = 0)
  const prefixLength = header.decorated
    ? header.decorated.prefixes.join("").length
    : 0;
  const absoluteCursor = prefixLength + header.cursor;

  useInput((input, key) => {
    if (!isFocused) return;

    // Tab key: cycle through suggestions
    if (key.tab && !key.shift) {
      dispatch(headerSuggestionNext());
      return;
    }
    if (key.tab && key.shift) {
      dispatch(headerSuggestionPrev());
      return;
    }

    // Suggestion mode: accept or cancel
    if (header.suggestionIndex !== undefined) {
      if (key.return || input === "\r") {
        dispatch(headerSuggestionAccept());
      } else if (key.escape) {
        dispatch(headerSuggestionCancel());
      }
      return;
    }

    // Normal mode: handle key inputs
    // Delete/Backspace
    if (key.backspace || key.delete) {
      dispatch(headerDelete());
      return;
    }

    // Navigation: arrow keys
    if (key.leftArrow) {
      dispatch(headerCursorLeft());
      return;
    }
    if (key.rightArrow) {
      dispatch(headerCursorRight());
      return;
    }
    if (key.downArrow) {
      dispatch(focusBody());
      return;
    }
    if (key.upArrow) {
      dispatch(focusFooter());
      return;
    }

    // Ctrl shortcuts
    if (key.ctrl && input === "a") {
      dispatch(headerGoToStart());
      return;
    }
    if (key.ctrl && input === "e") {
      dispatch(headerGoToEnd());
      return;
    }

    // Return key: move to body
    if (key.return || input === "\r") {
      dispatch(focusBody());
      return;
    }

    // Character input (exclude ctrl/meta combinations)
    if (!key.ctrl && !key.meta && input.length > 0) {
      dispatch(headerType({ char: input }));
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
            {/* Gutter: shows "❯" when focused, "│" otherwise */}
            <Box width={GUTTER_WIDTH} marginX={GUTTER_MARGIN}>
              <Text color={isFocused ? "green" : undefined}>
                {isFocused ? index === 0 ? `❯` : ` ` : `│`}
              </Text>
            </Box>
            {
              /* First line with decorated message: use DecoratedText for proper styling
                - Prefixes/suffixes are dimmed
                - User text has normal color with cursor
                Note: For multi-line decorated messages, only first line shows decoration */
            }
            {header.decorated && index === 0
              ? (
                <DecoratedText
                  decorated={header.decorated}
                  cursor={header.cursor}
                  isFocused={isFocused}
                />
              )
              : (
                /* Non-decorated or continuation lines: use standard line display */
                <EditCommitMessageLine
                  line={line}
                  cursor={absoluteCursor}
                  isFocused={isFocused}
                  isAiMode={isAiMode}
                />
              )}
          </Box>
        ))}
        {
          /* Autocomplete suggestions list
            - Shows filtered suggestions based on current input
            - Limited to 5 visible items with scrolling support
            - Highlighted suggestion (selected with Tab) has inverse colors
            - Format: "→ [typed][suggestion] - description" */
        }
        <Box flexDirection="column">
          {isFocused &&
            (() => {
              const VISIBLE_COUNT = 5;
              const totalSuggestions = header.filteredSuggestion.length;
              const scrollOffset = header.suggestionScrollOffset;
              const visibleEnd = Math.min(
                scrollOffset + VISIBLE_COUNT,
                totalSuggestions,
              );
              const visibleSuggestions = header.filteredSuggestion.slice(
                scrollOffset,
                visibleEnd,
              );

              return visibleSuggestions.map((suggestion, visibleIndex) => {
                // Calculate the actual index in the full suggestions array
                const actualIndex = scrollOffset + visibleIndex;

                return (
                  <Box key={actualIndex} flexDirection="row">
                    {/* Arrow indicator - green when selected */}
                    <Box width={1} marginX={1}>
                      <Text
                        color={header.suggestionIndex === actualIndex
                          ? "green"
                          : undefined}
                      >
                        {`→`}
                      </Text>
                    </Box>
                    {/* Already typed part - green text */}
                    <Text
                      color="green"
                      inverse={header.suggestionIndex === actualIndex}
                    >
                      {header.value}
                    </Text>
                    {/* Completion part - blue text */}
                    <Text
                      color="blue"
                      inverse={header.suggestionIndex === actualIndex}
                    >
                      {`${suggestion.value.slice(header.value.length)}`}
                    </Text>
                    {/* Description - gray text */}
                    <Text
                      wrap="truncate"
                      color="gray"
                    >
                      {` - ${suggestion.description}`}
                    </Text>
                  </Box>
                );
              });
            })()}
        </Box>
      </Box>
    </Box>
  );
};
