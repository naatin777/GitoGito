import { ConsoleNode } from "../console_node.ts";
import { CompletionItem } from "../types.ts";
import { CommitContext } from "./context.ts";

export class SubjectNode extends ConsoleNode<CommitContext> {
  override id = "subject" as const;

  constructor() {
    super([
      { to: "subject", trigger: /^[\s\S]+/ },
    ]);
  }

  async getSuggestions(): Promise<CompletionItem[]> {
    return [];
  }

  // 親のrenderを使いつつ、文字数カウンター機能を追加（拡張）

  // override render(ctx: FragmentContext): TextFragment[] {
  //   const frags = super.render(ctx);

  //   if (ctx.isPrimary) {
  //     const len = ctx.value.length;
  //     const max = this.maxHeaderLength;
  //     frags.push({
  //       text: ` (${len}/${max})`,
  //       isEditable: false,
  //       isLocked: true,
  //       isIncludeInOutput: false,
  //       role: len > max ? "error" : "meta",
  //     });
  //   }
  //   return frags;
  // }
}
