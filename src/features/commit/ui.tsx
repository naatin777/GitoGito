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
    <box>
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
      {state.step === "done" && <text>Done</text>}
      {state.step === "error" && <text fg="red">Error: {state.message}</text>}
    </box>
  );
}
