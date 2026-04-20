import { TextAttributes } from "@opentui/core";
import { useKeyboard, useRenderer } from "@opentui/react";
import { useState } from "react";
import { useThemeColors } from "../features/config/use_theme_colors.ts";
import { useThemeMode } from "../contexts/theme_mode_context.tsx";
import { isCtrlC, isEnter } from "../helpers/opentui/key.ts";
import { Box, Text } from "./ThemedComponents.tsx";
// import { renderTui } from "../lib/opentui_render.tsx";

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

export function getSafeCarouselIndex(
  selectedIndex: number,
  choiceCount: number,
) {
  return choiceCount > 0 ? Math.max(0, Math.min(selectedIndex, choiceCount - 1)) : 0;
}

/* v8 ignore start */
export function Carousel<T>({ message, choices, onSelect }: CarouselProps<T>) {
  const themeColors = useThemeColors();
  const renderer = useRenderer();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const hasChoices = choices.length > 0;
  const safeSelectedIndex = getSafeCarouselIndex(selectedIndex, choices.length);
  const themeMode = useThemeMode();


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
      onSelect(choices[safeSelectedIndex].value);
    }
  });

  return (
    <Box flexDirection="column" paddingLeft={1} paddingRight={1}>
      <Box>
        <Text attributes={TextAttributes.BOLD}>{`? ${message} `}</Text>
      </Box>
      <Box>
        <Text attributes={TextAttributes.DIM}>
          {getCarouselPositionLabel(safeSelectedIndex, choices.length)}
        </Text>
        <Text attributes={TextAttributes.DIM}>(Enter to Select)</Text>
      </Box>

      {hasChoices
        ? (
          <Box
            flexDirection="column"
            border
            borderStyle="rounded"
            borderColor={themeColors.primary}
            paddingLeft={1}
            paddingRight={1}
          >
            <Text attributes={TextAttributes.BOLD} fg={themeColors.primary} truncate>
              {choices[safeSelectedIndex].name}
            </Text>
            {choices[safeSelectedIndex].description && (
              <Box marginTop={1}>
                <Text>{choices[safeSelectedIndex].description}</Text>
              </Box>
            )}
          </Box>
        )
        : (
          <Text attributes={TextAttributes.DIM}>
            {CAROUSEL_EMPTY_MESSAGE}
          </Text>
        )}
    </Box>
  );
}
/* v8 ignore stop */

// /* v8 ignore start */
// if (import.meta.main) {
//   const instance = renderTui(
//     <Carousel
//       message="Select an option"
//       choices={[
//         {
//           name: "Option 1",
//           value: "1",
//           description: "This is the first option",
//         },
//         {
//           name: "Option 2",
//           value: "2",
//           description:
//             "This is the second option with a longer description that might wrap around if the terminal is small. This is the second option with a longer description that might wrap around if the terminal is small. This is the second option with a longer description that might wrap around if the terminal is small.",
//         },
//         { name: "Option 3", value: "3", description: "Short desc" },
//       ]}
//       onSelect={(val) => console.log("Selected:", val)}
//     />,
//   );

//   await instance.waitUntilExit();
// }
// /* v8 ignore stop */
