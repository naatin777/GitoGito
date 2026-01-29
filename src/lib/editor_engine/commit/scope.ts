import type { Suggestion } from "../../../services/config/index.ts";
import { ConsoleNode } from "../console_node.ts";
import type { CompletionItem, FragmentContext, TextFragment } from "../types.ts";
import type { CommitContext } from "./context.ts";

export class ScopeNode extends ConsoleNode<CommitContext> {
  override id = "scope" as const;

  constructor(private scopes: Suggestion[]) {
    super([
      { to: "separator", trigger: /^\([^)]+\)(?=!?:)/ },
      { to: "scope", trigger: /^\([^)]*/ },
    ]);
  }

  getSuggestions(input: string): Promise<CompletionItem[]> {
    // Remove opening paren for matching
    const cleanInput = input.replace(/^\(/, "");

    return Promise.resolve(
      this.scopes
        .filter((t) => t.value.startsWith(cleanInput))
        .map((t) => ({
          matchValue: cleanInput,
          unmatchedValue: t.value.slice(cleanInput.length),
          description: t.description,
        })),
    );
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
