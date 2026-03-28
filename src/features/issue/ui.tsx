import { AgentLoop } from "../../components/AgentLoop.tsx";
import { Carousel } from "../../components/Carousel.tsx";
import { Select } from "../../components/Select.tsx";
import { Spinner } from "../../components/Spinner.tsx";
import { TextInput } from "../../components/TextInput.tsx";
import { ISSUE_SYSTEM_MESSAGE } from "../../constants/message.ts";
import type { Issue as IssueEntity, IssueTemplate } from "../../type.ts";
import { useIssueFlow } from "./hook.ts";

export function buildIssueTemplateChoices(templates: IssueTemplate[]) {
  return templates.map((template) => ({
    name: template.name,
    value: template,
    description: template.about,
  }));
}

export function buildGeneratedIssueChoices(issues: IssueEntity[]) {
  return issues.map((issue) => ({
    name: issue.title,
    value: issue,
    description: issue.body,
  }));
}

export function getIssueCreatedText(url: string) {
  return `Issue created: ${url}`;
}

export function getIssueErrorText(message: string) {
  return `Error: ${message}`;
}

/* v8 ignore start */
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
          choices={buildIssueTemplateChoices(state.templates)}
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
          choices={buildGeneratedIssueChoices(state.issues.issue)}
          onSelect={selectIssue}
        />
      )}
      {state.step === "edit_issue" && <Spinner handleDataLoading={editIssue} />}
      {state.step === "creating" && <Spinner handleDataLoading={createIssue} />}
      {state.step === "done" && (
        <box flexDirection="column">
          <text fg="green">{getIssueCreatedText(state.url)}</text>
        </box>
      )}
      {state.step === "error" && (
        <text fg="red">{getIssueErrorText(state.message)}</text>
      )}
    </box>
  );
}
/* v8 ignore stop */
