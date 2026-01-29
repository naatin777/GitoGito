import { unicodeWidth } from "@std/cli";

export type Line = {
  text: string;
  start: number;
};

export const splitTextToLines = (text: string, maxWidth: number) => {
  const lines: Line[] = [];

  if (maxWidth <= 0) return [{ text: text, start: 0 }];

  let currentLine = "";
  let currentLineWidth = 0;
  let currentLineStartIndex = 0;

  let i = 0;
  for (const char of text) {
    if (char === "\n") {
      lines.push({ text: currentLine, start: currentLineStartIndex });
      currentLine = "";
      currentLineWidth = 0;
      i += char.length;
      currentLineStartIndex = i;
      continue;
    }

    const w = unicodeWidth(char);

    if (currentLineWidth + w > maxWidth && currentLineWidth > 0) {
      lines.push({ text: currentLine, start: currentLineStartIndex });
      currentLine = "";
      currentLineWidth = 0;
      currentLineStartIndex = i;
    }

    currentLine += char;
    currentLineWidth += w;
    i += char.length;
  }

  lines.push({ text: currentLine, start: currentLineStartIndex });

  return lines;
};
