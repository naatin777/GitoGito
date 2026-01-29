import { Box, Text } from "ink";
import { Select } from "../../components/Select.tsx";
import { Spinner } from "../../components/Spinner.tsx";
import { useCommitFlow } from "./hook.ts";

export function Commit() {
  const {
    state,
    generateCommitMessages,
    selectCommitMessage,
    commitMessage,
    editCommitMessage,
  } = useCommitFlow();

  return (
    <Box>
      {state.step === "loading" && (
        <Spinner handleDataLoading={generateCommitMessages} />
      )}
      {state.step === "select" && (
        <Select
          message="Enter commit messages"
          choices={state.messages.commit_message.map((m) => ({
            name: m.header,
            value: m,
            description: [m.body, m.footer].filter(Boolean).join("\n\n"),
          }))}
          onSelect={selectCommitMessage}
        />
      )}
      {state.step === "edit" && (
        <Spinner handleDataLoading={editCommitMessage} />
      )}
      {state.step === "commit" && <Spinner handleDataLoading={commitMessage} />}
      {state.step === "done" && <Text>Done</Text>}
      {state.step === "error" && <Text color="red">Error: {state.message}
      </Text>}
    </Box>
  );
}
