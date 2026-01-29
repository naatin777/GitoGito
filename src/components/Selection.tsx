import { useState } from "react";
import { Select } from "./Select.tsx";
import { TextInput } from "./TextInput.tsx";
import { LANGUAGES } from "../constants/language.ts";
import { EDITORS } from "../constants/editor.ts";

export function LanguageSelector(
  { onSelect }: { onSelect: (value: string) => void },
) {
  return (
    <Select
      message="Select language"
      choices={LANGUAGES.map((l) => ({
        name: `${l.code} - ${l.label}`,
        value: `${l.code} - ${l.label}`,
        description: `Use ${l.label} for AI responses`,
      }))}
      onSelect={(val?: string) => val && onSelect(val)}
    />
  );
}

export function EditorSelector(
  { onSelect }: { onSelect: (value: string) => void },
) {
  const [showCustom, setShowCustom] = useState(false);

  if (showCustom) {
    return (
      <TextInput
        label="? Enter custom editor command › "
        isInline
        onSubmit={onSelect}
      />
    );
  }

  const choices = [
    ...EDITORS.map((e) => ({
      name: e.label,
      value: e.value,
      description: `Launch with: ${e.value}`,
    })),
    {
      name: "Other...",
      value: "CUSTOM",
      description: "Enter a custom command",
    },
  ];

  return (
    <Select
      message="Select editor"
      choices={choices}
      onSelect={(val?: string) => {
        if (val === "CUSTOM") {
          setShowCustom(true);
        } else if (val) {
          onSelect(val);
        }
      }}
    />
  );
}

export function OverviewInput(
  { onSubmit }: { onSubmit: (value: string) => void },
) {
  return (
    <TextInput
      label="? Enter the project overview › "
      onSubmit={onSubmit}
    />
  );
}
