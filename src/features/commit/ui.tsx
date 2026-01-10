import { Box, Text } from "ink";
import { useCommitFlow } from "./hook.ts";
import { Spinner } from "../../components/spinner.tsx";
import { Select } from "../../components/select.tsx";

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
      {state.step === "error" && <Text>Error</Text>}
    </Box>
  );
}
