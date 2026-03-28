import { TextAttributes } from "@opentui/core";
import { useKeyboard, useRenderer } from "@opentui/react";
import { useState } from "react";
import { SELECT_EMPTY_MESSAGE } from "../constants/message.ts";
import { isCtrlC, isEnter } from "../helpers/opentui/key.ts";
import { renderTui } from "../lib/opentui_render.tsx";
import type { Choice } from "../type.ts";

export { SELECT_EMPTY_MESSAGE };

type SelectOptions<T> = {
  message: string;
  choices: Choice<T>[];
  onSelect: (value?: T) => void;
};

export function getSelectPositionLabel(
  selectedIndex: number,
  choiceCount: number,
) {
  return `(${choiceCount > 0 ? selectedIndex + 1 : 0}/${choiceCount})`;
}

export function getSafeSelectIndex(selectedIndex: number, choiceCount: number) {
  return choiceCount > 0 ? Math.max(0, Math.min(selectedIndex, choiceCount - 1)) : 0;
}

/* v8 ignore start */
export function Select<T>(options: SelectOptions<T>) {
  const renderer = useRenderer();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const hasChoices = options.choices.length > 0;
  const safeSelectedIndex = getSafeSelectIndex(
    selectedIndex,
    options.choices.length,
  );

  useKeyboard((event) => {
    if (event.name === "escape" || isCtrlC(event)) {
      options.onSelect(undefined);
      renderer.destroy();
      return;
    }

    if (!hasChoices) {
      if (isEnter(event)) {
        options.onSelect(undefined);
        renderer.destroy();
      }
      return;
    }

    if (event.name === "up") {
      setSelectedIndex((prev) =>
        (prev - 1 + options.choices.length) % options.choices.length
      );
    }

    if (event.name === "down") {
      setSelectedIndex((prev) => (prev + 1) % options.choices.length);
    }

    if (isEnter(event)) {
      options.onSelect(options.choices[safeSelectedIndex].value);
    }
  });

  return (
    <box flexDirection="column" paddingLeft={1} paddingRight={1}>
      <box>
        <text>{`${options.message} `}</text>
        <text attributes={TextAttributes.DIM}>
          {getSelectPositionLabel(safeSelectedIndex, options.choices.length)}
        </text>
      </box>
      {hasChoices
        ? options.choices.map((value, index) => {
          const isSelected = safeSelectedIndex === index;
          return (
            <box
              key={value.name}
              flexDirection="column"
            >
              <text
                attributes={TextAttributes.BOLD}
                truncate
                fg={isSelected ? "blue" : undefined}
              >
                {`→ ${value.name}`}
              </text>
              {isSelected && (
                <box
                  paddingLeft={1}
                  borderStyle="single"
                  border={[
                    "left",
                  ]}
                  borderColor="gray"
                >
                  <text attributes={TextAttributes.DIM}>{`${value.description}`}</text>
                </box>
              )}
            </box>
          );
        })
        : (
          <text attributes={TextAttributes.DIM}>
            {SELECT_EMPTY_MESSAGE}
          </text>
        )}
    </box>
  );
}
/* v8 ignore stop */

/* v8 ignore start */
if (import.meta.main) {
  const instance = renderTui(
    <Select
      message="Select an option"
      choices={[
        { name: "Option 1", value: "option1", description: "Description 1" },
        { name: "Option 2", value: "option2", description: "Description 2" },
        { name: "Option 3", value: "option3", description: "Description 3" },
      ]}
      onSelect={(value) => console.log("Selected:", value)}
    />,
  );

  await instance.waitUntilExit();
}
/* v8 ignore stop */
