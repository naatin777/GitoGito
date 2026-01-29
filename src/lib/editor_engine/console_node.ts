import type {
  CompletionItem,
  FragmentContext,
  TextFragment,
  Transition,
} from "./types.ts";

export abstract class ConsoleNode<T> {
  abstract id: keyof T;

  constructor(
    public next: Transition<T>[],
  ) {}

  abstract getSuggestions(
    input: string,
  ): Promise<CompletionItem[]>;

  render(ctx: FragmentContext): TextFragment[] {
    const { value } = ctx;

    return [
      {
        text: value,
        role: "primary",
        isEditable: true,
        isLocked: false,
        isIncludeInOutput: true,
      },
    ];
  }
}
