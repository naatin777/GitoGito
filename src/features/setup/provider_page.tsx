import { useRenderer } from "@opentui/react";
import { useAppDispatch, useAppSelector } from "../../app/hooks.ts";
import { Select } from "../../components/Select.tsx";
import {
  AI_PROVIDER,
  type AiModel,
} from "../../services/config/schema/fields/ai_schema.ts";
import { setProvider } from "./setup_slice.ts";
import { useSetupNavigation } from "./hook.ts";

const providerDescriptions: Record<AiModel["provider"], string> = {
  Ollama: "Local model, no API key required.",
  OpenRouter: "Cloud models via OpenRouter (API key required).",
  Gemini: "Google Gemini models (API key required).",
  CodexCLI: "Codex CLI-compatible cloud models via OpenRouter (API key required).",
  ClaudeCode: "Claude Code-compatible cloud models via OpenRouter (API key required).",
  CodexCLIWithOllama: "Codex CLI-compatible local models via Ollama.",
  ClaudeCodeWithOllama: "Claude Code-compatible local models via Ollama.",
};

const providerChoices = AI_PROVIDER.map((p) => ({
  name: p,
  value: p,
  description: providerDescriptions[p],
}));

/* v8 ignore start */
export function ProviderPage() {
  const dispatch = useAppDispatch();
  const nav = useSetupNavigation();
  const renderer = useRenderer();
  const currentProvider = useAppSelector((state) => state.setup.provider);
  const initialIndex = AI_PROVIDER.indexOf(currentProvider);

  return (
    <Select
      message="Select AI provider"
      choices={[...providerChoices]}
      initialIndex={initialIndex}
      onSelect={(provider) => {
        if (!provider) {
          renderer.destroy();
          return;
        }
        dispatch(setProvider(provider));
        nav.forward.fromProvider();
      }}
    />
  );
}
/* v8 ignore stop */
