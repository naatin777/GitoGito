import { Box, render, Text, useApp, useInput } from "ink";
import { useEffect, useState } from "react";

export function TextInput(
  { label, isInline, onSubmit }: {
    label: string;
    isInline?: boolean;
    onSubmit: (val: string) => void;
  },
) {
  const [value, setValue] = useState("");
  const [cursorPosition, setCursorPosition] = useState(0);
  const [showCursor, setShowCursor] = useState(true);
  const { exit } = useApp();

  useEffect(() => {
    const timer = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500);

    return () => clearInterval(timer);
  }, []);

  useInput((input, key) => {
    setShowCursor(true);

    if (key.escape || (input === "c" && key.ctrl)) {
      exit();
      return;
    }

    if (key.return) {
      onSubmit(value);
      return;
    }

    if (key.leftArrow) {
      setCursorPosition((p) => Math.max(0, p - 1));
      return;
    }

    if (key.rightArrow) {
      setCursorPosition((p) => Math.min(value.length, p + 1));
      return;
    }

    if (key.backspace || key.delete) {
      if (cursorPosition > 0) {
        setValue((v) =>
          v.slice(0, cursorPosition - 1) + v.slice(cursorPosition)
        );
        setCursorPosition((p) => p - 1);
      }
      return;
    }

    if (key.ctrl && input === "a") {
      setCursorPosition(0);
      return;
    }
    if (key.ctrl && input === "e") {
      setCursorPosition(value.length);
      return;
    }

    if (!key.ctrl && !key.meta) {
      setValue((v) =>
        v.slice(0, cursorPosition) + input + v.slice(cursorPosition)
      );
      setCursorPosition((p) => p + input.length);
    }
  });

  const before = value.slice(0, cursorPosition);
  const charAtCursor = value[cursorPosition] || " ";
  const after = value.slice(cursorPosition + 1);

  return (
    <Box flexDirection={isInline ? "row" : "column"}>
      <Text bold>{label}</Text>
      {isInline
        ? (
          <Box flexDirection="row">
            <Text color="green">{before}</Text>
            <Text color="green" inverse={showCursor}>{charAtCursor}</Text>
            <Text color="green">{after}</Text>
          </Box>
        )
        : (
          <Box>
            <Text color="green">{before}</Text>
            <Text color="green" inverse={showCursor}>{charAtCursor}</Text>
            <Text color="green">{after}</Text>
          </Box>
        )}
    </Box>
  );
}

if (import.meta.main) {
  render(
    <TextInput
      label="? Enter something › "
      isInline
      onSubmit={(val) => {
        console.log("Submitted:", val);
      }}
    />,
  );
}
