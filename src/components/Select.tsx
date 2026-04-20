import { TextAttributes } from "@opentui/core";
import { useKeyboard, useRenderer } from "@opentui/react";
import { useState } from "react";
import { SELECT_EMPTY_MESSAGE } from "../constants/message.ts";
import { isCtrlC, isEnter } from "../helpers/opentui/key.ts";
// import { renderTui } from "../lib/opentui_render.tsx";
import { useThemeColors } from "../features/config/use_theme_colors.ts";
import { Box, Text } from "./ThemedComponents.tsx";
import type { Choice } from "../type.ts";

export { SELECT_EMPTY_MESSAGE };

type SelectOptions<T> = {
  message: string;
  choices: Choice<T>[];
  onSelect: (value?: T) => void;
  onBack?: () => void;
  initialIndex?: number;
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
  const themeColors = useThemeColors();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const hasChoices = options.choices.length > 0;
  const safeSelectedIndex = getSafeSelectIndex(
    selectedIndex,
    options.choices.length,
  );

  useKeyboard((event) => {
    if (isCtrlC(event)) {
      options.onSelect(undefined);
      renderer.destroy();
      return;
    }

    if (event.name === "escape") {
      if (options.onBack) {
        options.onBack();
      } else {
        options.onSelect(undefined);
        renderer.destroy();
      }
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
    <Box flexDirection="column" paddingLeft={1} paddingRight={1}>
      <Box>
        <Text>{`${options.message} `}</Text>
        <Text attributes={TextAttributes.DIM}>
          {getSelectPositionLabel(safeSelectedIndex, options.choices.length)}
        </Text>
      </Box>
      {hasChoices
        ? options.choices.map((value, index) => {
          const isSelected = safeSelectedIndex === index;
          return (
            <Box
              key={value.name}
              flexDirection="column"
            >
              <Text
                attributes={TextAttributes.BOLD}
                truncate
                fg={isSelected ? themeColors.primary : undefined}
              >
                {`→ ${value.name}`}
              </Text>
              {isSelected && (
                <Box
                  paddingLeft={1}
                  borderStyle="single"
                  border={[
                    "left",
                  ]}
                  borderColor="gray"
                >
                  <Text attributes={TextAttributes.DIM}>{`${value.description}`}</Text>
                </Box>
              )}
            </Box>
          );
        })
        : (
          <Text attributes={TextAttributes.DIM}>
            {SELECT_EMPTY_MESSAGE}
          </Text>
        )}
    </Box>
  );
}
/* v8 ignore stop */

// /* v8 ignore start */
// if (import.meta.main) {
//   const instance = renderTui(
//     <Select
//       message="Select an option"
//       choices={[
//         { name: "Option 1", value: "option1", description: "Description 1" },
//         { name: "Option 2", value: "option2", description: "Description 2" },
//         { name: "Option 3", value: "option3", description: "Description 3" },
//       ]}
//       onSelect={(value) => console.log("Selected:", value)}
//     />,
//   );

//   await instance.waitUntilExit();
// }
// /* v8 ignore stop */
