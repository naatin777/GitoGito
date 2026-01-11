import { Box, render, Text, useApp, useInput } from "ink";
import { useState } from "react";

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

export function Carousel<T>({ message, choices, onSelect }: CarouselProps<T>) {
  const { exit } = useApp();
  const [selectedIndex, setSelectedIndex] = useState(0);

  useInput((input, key) => {
    if (key.escape || (input === "c" && key.ctrl)) {
      onSelect(undefined);
      exit();
      return;
    }

    if (key.leftArrow) {
      setSelectedIndex((prev) => (prev - 1 + choices.length) % choices.length);
    }

    if (key.rightArrow) {
      setSelectedIndex((prev) => (prev + 1) % choices.length);
    }

    if (key.return) {
      onSelect(choices[selectedIndex].value);
    }
  });

  const current = choices[selectedIndex];

  return (
    <Box flexDirection="column" paddingLeft={1} paddingRight={1}>
      <Box>
        <Text bold>{`? ${message} `}</Text>
      </Box>
      <Box>
        <Text dimColor>
          {`← ${selectedIndex + 1}/${choices.length} →`}
        </Text>
        <Text dimColor>(Enter to Select)</Text>
      </Box>

      <Box
        flexDirection="column"
        borderStyle="round"
        borderColor="cyan"
        paddingLeft={1}
        paddingRight={1}
      >
        <Text bold color="cyan" wrap="truncate-end">
          {current.name}
        </Text>
        {current.description && (
          <Box marginTop={1}>
            <Text>{current.description}</Text>
          </Box>
        )}
      </Box>
    </Box>
  );
}

if (import.meta.main) {
  render(
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
}
