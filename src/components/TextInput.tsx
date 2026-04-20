import { TextAttributes } from "@opentui/core";
import { useKeyboard, useRenderer } from "@opentui/react";
import { useEffect, useState } from "react";
import { Box, Text } from "./ThemedComponents.tsx";
import { useThemeColors } from "../features/config/use_theme_colors.ts";
import { isCtrlC, isEnter, keyEventToInput } from "../helpers/opentui/key.ts";
// import { renderTui } from "../lib/opentui_render.tsx";

export function TextInput(
  { label, isInline, onSubmit }: {
    label: string;
    isInline?: boolean;
    onSubmit: (val: string) => void;
  },
) {
  const themeColors = useThemeColors();
  const [value, setValue] = useState("");
  const [cursorPosition, setCursorPosition] = useState(0);
  const [showCursor, setShowCursor] = useState(true);
  const renderer = useRenderer();

  useEffect(() => {
    const timer = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500);

    return () => clearInterval(timer);
  }, []);

  useKeyboard((event) => {
    const input = keyEventToInput(event);
    setShowCursor(true);

    if (event.name === "escape" || isCtrlC(event)) {
      renderer.destroy();
      return;
    }

    if (isEnter(event)) {
      onSubmit(value);
      return;
    }

    if (event.name === "left") {
      setCursorPosition((p) => Math.max(0, p - 1));
      return;
    }

    if (event.name === "right") {
      setCursorPosition((p) => Math.min(value.length, p + 1));
      return;
    }

    if (event.name === "backspace" || event.name === "delete" || event.name === "forwarddelete") {
      if (cursorPosition > 0) {
        setValue((v) =>
          v.slice(0, cursorPosition - 1) + v.slice(cursorPosition)
        );
        setCursorPosition((p) => p - 1);
      }
      return;
    }

    if (event.ctrl && input === "a") {
      setCursorPosition(0);
      return;
    }

    if (event.ctrl && input === "e") {
      setCursorPosition(value.length);
      return;
    }

    if (!event.ctrl && !event.meta && input.length > 0) {
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
      <Text attributes={TextAttributes.BOLD}>{label}</Text>
      {isInline
        ? (
          <Box flexDirection="row">
            <text fg={themeColors.primary}>{before}</text>
            <text
              fg={themeColors.primary}
              attributes={showCursor ? TextAttributes.INVERSE : 0}
            >
              {charAtCursor}
            </text>
            <text fg={themeColors.primary}>{after}</text>
          </Box>
        )
        : (
          <Box>
            <text fg={themeColors.primary}>{before}</text>
            <text
              fg={themeColors.primary}
              attributes={showCursor ? TextAttributes.INVERSE : 0}
            >
              {charAtCursor}
            </text>
            <text fg={themeColors.primary}>{after}</text>
          </Box>
        )}
    </Box>
  );
}

// if (import.meta.main) {
//   const instance = renderTui(
//     <TextInput
//       label="? Enter something › "
//       isInline
//       onSubmit={(val) => {
//         console.log("Submitted:", val);
//       }}
//     />,
//   );

//   await instance.waitUntilExit();
// }
