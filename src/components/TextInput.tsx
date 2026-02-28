import { TextAttributes } from "@opentui/core";
import { useKeyboard, useRenderer } from "@opentui/react";
import { useEffect, useState } from "react";
import { isCtrlC, isEnter, keyEventToInput } from "../helpers/opentui/key.ts";
import { renderTui } from "../lib/opentui_render.tsx";

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
    <box flexDirection={isInline ? "row" : "column"}>
      <text attributes={TextAttributes.BOLD}>{label}</text>
      {isInline
        ? (
          <box flexDirection="row">
            <text fg="green">{before}</text>
            <text
              fg="green"
              attributes={showCursor ? TextAttributes.INVERSE : 0}
            >
              {charAtCursor}
            </text>
            <text fg="green">{after}</text>
          </box>
        )
        : (
          <box>
            <text fg="green">{before}</text>
            <text
              fg="green"
              attributes={showCursor ? TextAttributes.INVERSE : 0}
            >
              {charAtCursor}
            </text>
            <text fg="green">{after}</text>
          </box>
        )}
    </box>
  );
}

if (import.meta.main) {
  const instance = renderTui(
    <TextInput
      label="? Enter something › "
      isInline
      onSubmit={(val) => {
        console.log("Submitted:", val);
      }}
    />,
  );

  await instance.waitUntilExit();
}
