import { unicodeWidth } from "@std/cli";

export type WrappedLine = {
  text: string;
  start: number;
};

/**
 * Wraps text at word boundaries to fit within maxWidth.
 * Unlike character-based wrapping, this preserves whole words.
 *
 * @param text - The text to wrap
 * @param maxWidth - Maximum width in characters (considering unicode width)
 * @returns Array of wrapped lines with their start positions
 *
 * @example
 * wrapTextByWords("fix: add user authentication feature", 20)
 * // => [
 * //   { text: "fix: add user", start: 0 },
 * //   { text: "authentication", start: 14 },
 * //   { text: "feature", start: 29 }
 * // ]
 */
export function wrapTextByWords(
  text: string,
  maxWidth: number,
): WrappedLine[] {
  const lines: WrappedLine[] = [];

  if (maxWidth <= 0) return [{ text: text, start: 0 }];

  // Split by existing newlines first
  const paragraphs = text.split("\n");
  let globalIndex = 0;

  for (let p = 0; p < paragraphs.length; p++) {
    const paragraph = paragraphs[p];

    if (paragraph.length === 0) {
      // Empty line
      lines.push({ text: "", start: globalIndex });
      if (p < paragraphs.length - 1) {
        globalIndex += 1; // for \n
      }
      continue;
    }

    let currentLine = "";
    let currentLineWidth = 0;
    let currentLineStartIndex = globalIndex;

    // Split paragraph into words and spaces
    const tokens = tokenizeText(paragraph);

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      const tokenWidth = calculateWidth(token.text);

      // Check if adding this token would exceed maxWidth
      if (currentLineWidth + tokenWidth > maxWidth && currentLineWidth > 0) {
        // Need to wrap

        if (token.type === "whitespace") {
          // Don't start a new line with whitespace
          // Push current line and skip this whitespace
          lines.push({ text: currentLine, start: currentLineStartIndex });
          currentLine = "";
          currentLineWidth = 0;
          globalIndex += token.text.length;
          currentLineStartIndex = globalIndex;
          continue;
        } else {
          // Word doesn't fit, wrap before it
          // Remove trailing whitespace from current line
          const trimmedLine = currentLine.trimEnd();
          const skippedLength = currentLine.length - trimmedLine.length;

          lines.push({ text: trimmedLine, start: currentLineStartIndex });

          // Account for skipped whitespace
          globalIndex += skippedLength;

          // Start new line with current word
          currentLine = token.text;
          currentLineWidth = tokenWidth;
          currentLineStartIndex = globalIndex;
          globalIndex += token.text.length;
          continue;
        }
      }

      // Token fits, add it to current line
      currentLine += token.text;
      currentLineWidth += tokenWidth;
      globalIndex += token.text.length;
    }

    // Push remaining content
    if (currentLine.length > 0) {
      lines.push({ text: currentLine, start: currentLineStartIndex });
    } else if (p === paragraphs.length - 1 && paragraph.length === 0) {
      // Last line is empty
      lines.push({ text: "", start: currentLineStartIndex });
    }

    // Account for newline character (except for last paragraph)
    if (p < paragraphs.length - 1) {
      globalIndex += 1; // for \n
    }
  }

  return lines.length > 0 ? lines : [{ text: "", start: 0 }];
}

type Token = {
  text: string;
  type: "word" | "whitespace";
};

/**
 * Tokenizes text into words and whitespace segments
 */
function tokenizeText(text: string): Token[] {
  const tokens: Token[] = [];
  let currentToken = "";
  let currentType: "word" | "whitespace" | null = null;

  for (const char of text) {
    const isWhitespace = /\s/.test(char);
    const charType: "word" | "whitespace" = isWhitespace
      ? "whitespace"
      : "word";

    if (currentType === null) {
      currentType = charType;
      currentToken = char;
    } else if (currentType === charType) {
      currentToken += char;
    } else {
      tokens.push({ text: currentToken, type: currentType });
      currentToken = char;
      currentType = charType;
    }
  }

  if (currentToken.length > 0 && currentType !== null) {
    tokens.push({ text: currentToken, type: currentType });
  }

  return tokens;
}

/**
 * Calculates the display width of text considering unicode characters
 */
function calculateWidth(text: string): number {
  let width = 0;
  for (const char of text) {
    width += unicodeWidth(char);
  }
  return width;
}
