import { useState } from "react";
import type z from "zod";
import { useAppDependencies } from "../contexts/app_dependencies_context.tsx";
// import { renderTui } from "../lib/opentui_render.tsx";
import { IssueAgentSchema, type IssueSchema } from "../schema.ts";
import { AIService } from "../services/ai/ai_service.ts";
import type { UsageCallback } from "../services/ai/types.ts";
import { Box } from "./ThemedComponents.tsx";
import { Spinner } from "./Spinner.tsx";
import { TextInput } from "./TextInput.tsx";

export function AgentLoop({
  initialMessages,
  onDone,
  onUsage,
}: {
  initialMessages: { role: "user" | "system" | "assistant"; content: string }[];
  onDone: (res: z.infer<typeof IssueSchema>) => void;
  onUsage?: UsageCallback;
}) {
  const [history, setHistory] = useState(initialMessages);
  const [status, setStatus] = useState<"thinking" | "answering">("thinking");
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const dependencies = useAppDependencies();

  const performStep = async () => {
    try {
      const aiService = await AIService.create(
        dependencies.config,
        dependencies.credentials,
      );
      const completion = await aiService.generateStructuredOutput(
        history,
        "issueAgent",
        IssueAgentSchema,
        onUsage,
      );

      if (!completion) {
        throw new Error("Failed to parse completion");
      }

      if (completion.agent.status === "question") {
        setQuestions(completion.agent.questions);
        setCurrentQuestionIndex(0);
        setStatus("answering");
      } else if (completion.agent.status === "final_answer") {
        onDone(completion.agent.item);
      } else {
        throw new Error(`Unexpected status received`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (status === "thinking") {
    return (
      <Spinner
        handleDataLoading={performStep}
      />
    );
  }

  const currentQ = questions[currentQuestionIndex];

  return (
    <Box flexDirection="column">
      <TextInput
        label={`? ${currentQ} › `}
        onSubmit={(val: string) => {
          const userAnswer = val || "leave it to you";
          const newHistory = [
            ...history,
            {
              role: "user" as const,
              content: `question: ${currentQ} answer: ${userAnswer}`,
            },
          ];
          setHistory(newHistory);
          if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex((p) => p + 1);
          } else {
            setStatus("thinking");
            performStep();
          }
        }}
      />
    </Box>
  );
}
// if (import.meta.main) {
//   const ExampleContent = () => {
//     const renderer = useRenderer();

//     return (
//       <AgentLoop
//         initialMessages={[
//           {
//             role: "system" as const,
//             content: ISSUE_SYSTEM_MESSAGE
//               .replace(/{{issueTemplate.title}}/g, "Bug Report")
//               .replace(/{{issueTemplate.body}}/g, "Describe the bug here."),
//           },
//           {
//             role: "user" as const,
//             content: "I want to create a new UI for the issue system.",
//           },
//         ]}
//         onDone={(res) => {
//           console.log("Done!", JSON.stringify(res, null, 2));
//           renderer.destroy();
//         }}
//       />
//     );
//   };

//   const Example = () => <ExampleContent />;

//   const instance = renderTui(<Example />);
//   await instance.waitUntilExit();
// }
