import { Box, render, Text, useApp, useInput } from "ink";
import type { Choice } from "../type.ts";
import { useState } from "react";

type SelectOptions<T> = {
  message: string;
  choices: Choice<T>[];
  onSelect: (value?: T) => void;
};

export function Select<T>(options: SelectOptions<T>) {
  const { exit } = useApp();

  const [selectedIndex, setSelectedIndex] = useState(0);

  useInput((input, key) => {
    if (key.escape || (input === "c" && key.ctrl)) {
      options.onSelect(undefined);
      exit();
      return;
    }

    if (key.upArrow) {
      setSelectedIndex((prev) =>
        (prev - 1 + options.choices.length) % options.choices.length
      );
    }

    if (key.downArrow) {
      setSelectedIndex((prev) => (prev + 1) % options.choices.length);
    }

    if (key.return) {
      options.onSelect(options.choices[selectedIndex].value);
    }
  });

  return (
    <Box flexDirection="column" paddingLeft={1} paddingRight={1}>
      <Box>
        <Text>{`${options.message} `}</Text>
        <Text dimColor>
          {`(${selectedIndex + 1}/${options.choices.length})`}
        </Text>
      </Box>
      {options.choices.map((value, index) => {
        const isSelected = selectedIndex === index;
        return (
          <Box
            key={value.name}
            flexDirection="column"
          >
            <Text
              bold
              wrap="truncate-end"
              color={isSelected ? "blue" : undefined}
            >
              {`→ ${value.name}`}
            </Text>
            {isSelected && (
              <Box
                paddingLeft={1}
                borderStyle="single"
                borderLeftColor="gray"
                borderTop={false}
                borderRight={false}
                borderBottom={false}
              >
                <Text dimColor>{`${value.description}`}</Text>
              </Box>
            )}
          </Box>
        );
      })}
    </Box>
  );
}

if (import.meta.main) {
  render(
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
}
