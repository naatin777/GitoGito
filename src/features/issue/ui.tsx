import { AgentLoop } from "../../components/AgentLoop.tsx";
import { Carousel } from "../../components/Carousel.tsx";
import { Select } from "../../components/Select.tsx";
import { Spinner } from "../../components/Spinner.tsx";
import { TextInput } from "../../components/TextInput.tsx";
import { ISSUE_SYSTEM_MESSAGE } from "../../constants/message.ts";
import { useIssueFlow } from "./hook.ts";

export function Issue() {
  const {
    state,
    loadTemplates,
    selectTemplate,
    submitOverview,
    handleAgentDone,
    selectIssue,
    editIssue,
    createIssue,
  } = useIssueFlow();

  return (
    <box flexDirection="column">
      {state.step === "loading_templates" && (
        <Spinner handleDataLoading={loadTemplates} />
      )}
      {state.step === "select_template" && (
        <Select
          message="Select an issue template"
          choices={state.templates.map((t) => ({
            name: t.name,
            value: t,
            description: t.about,
          }))}
          onSelect={selectTemplate}
        />
      )}
      {state.step === "input_overview" && (
        <TextInput
          label="? Enter the issue overview ›"
          onSubmit={submitOverview}
        />
      )}
      {state.step === "generating" && (
        <AgentLoop
          initialMessages={[
            {
              role: "system",
              content: ISSUE_SYSTEM_MESSAGE
                .replace(/{{issueTemplate.title}}/g, state.template.title)
                .replace(/{{issueTemplate.body}}/g, state.template.body),
            },
            {
              role: "user",
              content:
                `Here is the issue overview provided by the user:\n\n${state.overview}`,
            },
          ]}
          onDone={handleAgentDone}
        />
      )}
      {state.step === "select_issue" && (
        <Carousel
          message="Select an issue to edit"
          choices={state.issues.issue.map((item) => ({
            name: item.title,
            value: item,
            description: item.body,
          }))}
          onSelect={selectIssue}
        />
      )}
      {state.step === "edit_issue" && <Spinner handleDataLoading={editIssue} />}
      {state.step === "creating" && <Spinner handleDataLoading={createIssue} />}
      {state.step === "done" && (
        <box flexDirection="column">
          <text fg="green">Issue created: {state.url}</text>
        </box>
      )}
      {state.step === "error" && <text fg="red">Error occurred</text>}
    </box>
  );
}
