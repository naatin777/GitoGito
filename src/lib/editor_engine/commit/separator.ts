import { ConsoleNode } from "../console_node.ts";
import type { CompletionItem } from "../types.ts";
import type { CommitContext } from "./context.ts";

export class SeparatorNode extends ConsoleNode<CommitContext> {
  id = "separator" as const;

  constructor() {
    super(
      [{ to: "subject", trigger: /^!?:\s*/ }],
    );
  }

  getSuggestions(_input: string): Promise<CompletionItem[]> {
    // Separator doesn't provide suggestions
    return Promise.resolve([]);
  }
}
