import { EditCommitMessageContents } from "./components/Contents.tsx";
import { EditCommitMessageProvider } from "./state/context.tsx";

export const EditCommitMessage = () => {
  return (
    <EditCommitMessageProvider>
      <EditCommitMessageContents />
    </EditCommitMessageProvider>
  );
};
