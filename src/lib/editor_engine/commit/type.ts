import { ConsoleNode } from "../console_node.ts";
import type {
  CompletionItem,
  FragmentContext,
  TextFragment,
} from "../types.ts";
import type { CommitContext } from "./context.ts";

export class TypeNode extends ConsoleNode<CommitContext> {
  override id = "type" as const;

  constructor() {
    super([
      {
        to: "scope",
        trigger: /^\w+(?=\()/,
      },
      {
        to: "separator",
        trigger: /^\w+(?=!?:)/,
      },
      {
        to: "type",
        trigger: /^\w+/,
      },
    ]);
  }

  async getSuggestions(input: string): Promise<CompletionItem[]> {
    await console.log(input);
    return [];
  }

  override render(ctx: FragmentContext): TextFragment[] {
    const { value, isPrimary, selectIndex, completions } = ctx;
    const frags: TextFragment[] = [];

    // Main value fragment
    frags.push({
      text: value,
      role: "primary",
      isEditable: true,
      isLocked: false,
      isIncludeInOutput: true,
    });

    // Ghost text (completion preview) only for primary segment
    if (isPrimary && completions && selectIndex !== undefined) {
      const selected = completions[selectIndex];

      if (selected && selected.unmatchedValue) {
        frags.push({
          text: selected.unmatchedValue,
          role: "ghost",
          isEditable: false,
          isLocked: false,
          isIncludeInOutput: false,
        });
      }
    }

    return frags;
  }
}
