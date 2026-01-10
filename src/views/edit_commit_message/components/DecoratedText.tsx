/**
 * DecoratedText component
 * Displays commit message with decorators (dimmed, non-editable prefixes/suffixes)
 */

import { Text } from "ink";
import type { DecoratedMessage } from "../../../features/commit/domain/commit-decorator.ts";

type DecoratedTextProps = {
  decorated: DecoratedMessage;
  cursor?: number;
  isFocused?: boolean;
};

/**
 * Renders decorated message with proper styling
 * - Prefixes: dimmed, non-editable
 * - User text: normal color, editable
 * - Suffixes: dimmed, non-editable
 * - Cursor: shown in user text only (if focused)
 */
export function DecoratedText({
  decorated,
  cursor,
  isFocused,
}: DecoratedTextProps) {
  const prefixText = decorated.prefixes.join("");
  const userText = decorated.userText;
  const suffixText = decorated.suffixes.join("");

  // If cursor is provided and component is focused, split user text at cursor
  if (cursor !== undefined && isFocused) {
    const beforeCursor = userText.slice(0, cursor);
    const afterCursor = userText.slice(cursor);

    return (
      <>
        {/* Dimmed prefixes (non-editable) */}
        {prefixText.length > 0 && <Text dimColor>{prefixText}</Text>}

        {/* User text before cursor */}
        {beforeCursor.length > 0 && <Text>{beforeCursor}</Text>}

        {/* Cursor */}
        <Text inverse>{afterCursor[0] || " "}</Text>

        {/* User text after cursor */}
        {afterCursor.length > 1 && <Text>{afterCursor.slice(1)}</Text>}

        {/* Dimmed suffixes (non-editable) */}
        {suffixText.length > 0 && <Text dimColor>{suffixText}</Text>}
      </>
    );
  }

  // No cursor - just render the text with proper styling
  return (
    <>
      {/* Dimmed prefixes (non-editable) */}
      {prefixText.length > 0 && <Text dimColor>{prefixText}</Text>}

      {/* User text (editable) */}
      <Text>{userText}</Text>

      {/* Dimmed suffixes (non-editable) */}
      {suffixText.length > 0 && <Text dimColor>{suffixText}</Text>}
    </>
  );
}
