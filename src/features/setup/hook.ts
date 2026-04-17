import { useNavigate } from "react-router";
import { useAppSelector } from "../../app/hooks.ts";
import type { AiModel } from "../../services/config/schema/fields/ai_schema.ts";

function keyStepPathForProvider(provider: AiModel["provider"]): string | null {
  switch (provider) {
    case "OpenRouter":
    case "CodexCLI":
    case "ClaudeCode":
      return "/setup/open-router-key";
    case "Gemini":
      return "/setup/gemini-key";
    case "Ollama":
    case "CodexCLIWithOllama":
    case "ClaudeCodeWithOllama":
      return null;
  }
}

export function useSetupNavigation() {
  const navigate = useNavigate();
  const provider = useAppSelector((state) => state.setup.provider);

  function keyStepPath(): string | null {
    return keyStepPathForProvider(provider);
  }

  return {
    provider,
    forward: {
      fromProvider: () => navigate("/setup/model"),
      fromModel: () => navigate(keyStepPath() ?? "/setup/github-token"),
      fromKeyStep: () => navigate("/setup/github-token"),
      fromGithubToken: () => navigate("/setup/language"),
      fromLanguage: () => navigate("/setup/theme"),
      fromTheme: () => navigate("/setup/review"),
      fromReview: () => navigate("/setup/done"),
    },
    back: {
      fromModel: () => navigate("/setup"),
      fromKeyStep: () => navigate("/setup/model"),
      fromGithubToken: () => navigate(keyStepPath() ?? "/setup/model"),
      fromLanguage: () => navigate("/setup/github-token"),
      fromTheme: () => navigate("/setup/language"),
      fromReview: () => navigate("/setup/theme"),
      fromDone: () => navigate("/setup/review"),
    },
  };
}
