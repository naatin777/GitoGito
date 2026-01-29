import { ConsoleNode } from "../console_node.ts";
import { CompletionItem } from "../types.ts";
import { CommitContext } from "./context.ts";

export class SeparatorNode extends ConsoleNode<CommitContext> {
  override id = "separator" as const;

  constructor() {
    super(
      [{ to: "subject", trigger: /^!?:\s*/ }],
    );
  }

  async getSuggestions(_input: string): Promise<CompletionItem[]> {
    // Separator doesn't provide suggestions
    return [];
  }
}
