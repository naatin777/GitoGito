import { TextAttributes } from "@opentui/core";
import { useKeyboard, useRenderer } from "@opentui/react";
import { useState } from "react";
import { isCtrlC, isEnter } from "../helpers/opentui/key.ts";
import { renderTui } from "../lib/opentui_render.tsx";
import type { Choice } from "../type.ts";

type SelectOptions<T> = {
  message: string;
  choices: Choice<T>[];
  onSelect: (value?: T) => void;
};

export function Select<T>(options: SelectOptions<T>) {
  const renderer = useRenderer();
  const [selectedIndex, setSelectedIndex] = useState(0);

  useKeyboard((event) => {
    if (event.name === "escape" || isCtrlC(event)) {
      options.onSelect(undefined);
      renderer.destroy();
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
      options.onSelect(options.choices[selectedIndex].value);
    }
  });

  return (
    <box flexDirection="column" paddingLeft={1} paddingRight={1}>
      <box>
        <text>{`${options.message} `}</text>
        <text attributes={TextAttributes.DIM}>
          {`(${selectedIndex + 1}/${options.choices.length})`}
        </text>
      </box>
      {options.choices.map((value, index) => {
        const isSelected = selectedIndex === index;
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
      })}
    </box>
  );
}

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
