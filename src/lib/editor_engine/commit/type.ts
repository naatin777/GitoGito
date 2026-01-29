import type { Suggestion } from "../../../services/config/index.ts";
import { ConsoleNode } from "../console_node.ts";
import type { CompletionItem, FragmentContext, TextFragment } from "../types.ts";
import type { CommitContext } from "./context.ts";

export class TypeNode extends ConsoleNode<CommitContext> {
  override id = "type" as const;

  constructor(private types: Suggestion[]) {
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

  getSuggestions(input: string): Promise<CompletionItem[]> {
    const basic = this.types
      .filter((t) => t.value.startsWith(input))
      .map((t) => ({
        matchValue: input,
        unmatchedValue: t.value.slice(input.length),
        description: t.description,
      }));

    const exactMatch = this.types.find((t) => t.value === input);
    if (exactMatch) {
      return Promise.resolve([
        ...basic,
        {
          matchValue: input,
          unmatchedValue: ": ",
          description: `${exactMatch.description} (Subjectへ)`,
        },
        {
          matchValue: input,
          unmatchedValue: "!: ",
          description: `${exactMatch.description} (破壊的変更)`,
        },
        {
          matchValue: input,
          unmatchedValue: "(",
          description: `${exactMatch.description} (Scope指定)`,
        },
      ]);
    }
    return Promise.resolve(basic);
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
