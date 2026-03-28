import { TextAttributes } from "@opentui/core";
import { useKeyboard, useRenderer } from "@opentui/react";
import { useState } from "react";
import { isCtrlC, isEnter } from "../helpers/opentui/key.ts";
import { renderTui } from "../lib/opentui_render.tsx";

export interface CarouselChoice<T> {
  name: string;
  value: T;
  description?: string;
}

interface CarouselProps<T> {
  message: string;
  choices: CarouselChoice<T>[];
  onSelect: (value: T | undefined) => void;
}

export const CAROUSEL_EMPTY_MESSAGE =
  "No options available. Press Enter or Esc to go back.";

export function getCarouselPositionLabel(
  selectedIndex: number,
  choiceCount: number,
) {
  return `← ${choiceCount > 0 ? selectedIndex + 1 : 0}/${choiceCount} →`;
}

export function Carousel<T>({ message, choices, onSelect }: CarouselProps<T>) {
  const renderer = useRenderer();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const hasChoices = choices.length > 0;

  useKeyboard((event) => {
    if (event.name === "escape" || isCtrlC(event)) {
      onSelect(undefined);
      renderer.destroy();
      return;
    }

    if (!hasChoices) {
      if (isEnter(event)) {
        onSelect(undefined);
        renderer.destroy();
      }
      return;
    }

    if (event.name === "left") {
      setSelectedIndex((prev) => (prev - 1 + choices.length) % choices.length);
    }

    if (event.name === "right") {
      setSelectedIndex((prev) => (prev + 1) % choices.length);
    }

    if (isEnter(event)) {
      onSelect(choices[selectedIndex].value);
    }
  });

  return (
    <box flexDirection="column" paddingLeft={1} paddingRight={1}>
      <box>
        <text attributes={TextAttributes.BOLD}>{`? ${message} `}</text>
      </box>
      <box>
        <text attributes={TextAttributes.DIM}>
          {getCarouselPositionLabel(selectedIndex, choices.length)}
        </text>
        <text attributes={TextAttributes.DIM}>(Enter to Select)</text>
      </box>

      {hasChoices
        ? (
          <box
            flexDirection="column"
            border
            borderStyle="rounded"
            borderColor="cyan"
            paddingLeft={1}
            paddingRight={1}
          >
            <text attributes={TextAttributes.BOLD} fg="cyan" truncate>
              {choices[selectedIndex].name}
            </text>
            {choices[selectedIndex].description && (
              <box marginTop={1}>
                <text>{choices[selectedIndex].description}</text>
              </box>
            )}
          </box>
        )
        : (
          <text attributes={TextAttributes.DIM}>
            {CAROUSEL_EMPTY_MESSAGE}
          </text>
        )}
    </box>
  );
}

if (import.meta.main) {
  const instance = renderTui(
    <Carousel
      message="Select an option"
      choices={[
        {
          name: "Option 1",
          value: "1",
          description: "This is the first option",
        },
        {
          name: "Option 2",
          value: "2",
          description:
            "This is the second option with a longer description that might wrap around if the terminal is small. This is the second option with a longer description that might wrap around if the terminal is small. This is the second option with a longer description that might wrap around if the terminal is small.",
        },
        { name: "Option 3", value: "3", description: "Short desc" },
      ]}
      onSelect={(val) => console.log("Selected:", val)}
    />,
  );

  await instance.waitUntilExit();
}
