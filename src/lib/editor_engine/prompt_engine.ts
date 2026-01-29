import type { ConsoleNode } from "./console_node.ts";
import type { CompletionItem, TextFragment } from "./types.ts";

export class PromptEngine<T extends Record<string, string>> {
  private nodeMap = new Map<keyof T, ConsoleNode<T>>();

  constructor(
    nodes: ConsoleNode<T>[],
    private startNodeId: keyof T,
  ) {
    nodes.forEach((node) => this.nodeMap.set(node.id, node));
  }

  async analyze(
    input: string,
    cursor: number,
    selectIndex: number = 0,
  ): Promise<{ fragment: TextFragment[]; completions: CompletionItem[] }> {
    const allFragments: TextFragment[] = [];
    let currentNodeId = this.startNodeId;
    let remaining = input;
    let consumed = 0;
    let primaryCompletions: CompletionItem[] = [];

    while (remaining.length > 0) {
      const currentNode = this.nodeMap.get(currentNodeId);
      if (!currentNode) break;

      const transition = currentNode.next.find((t) =>
        t.trigger.test(remaining)
      );
      if (!transition) break;

      const match = remaining.match(transition.trigger);
      if (!match) break;

      const [value] = match;

      const isPrimary = consumed <= cursor &&
        cursor <= (consumed + value.length);

      const completions = await currentNode.getSuggestions(value);
      if (isPrimary) {
        primaryCompletions = completions;
      }

      allFragments.push(
        ...currentNode.render({
          value: value,
          isPrimary: isPrimary,
          selectIndex: selectIndex,
          completions: completions,
        }),
      );

      remaining = remaining.slice(value.length);
      consumed += value.length;

      if (!this.nodeMap.has(transition.to)) break;
      currentNodeId = transition.to;
    }

    return {
      fragment: allFragments,
      completions: primaryCompletions,
    };
  }
}
