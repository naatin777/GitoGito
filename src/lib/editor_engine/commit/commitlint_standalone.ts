/**
 * commitlint スタンドアロン補完エンジン
 *
 * scope.ts / separator.ts / subject.ts / type.ts に依存せず、
 * ConsoleNode / PromptEngine / types だけをベースにノードを全部このファイルで定義する。
 *
 * 使い方:
 *   const { engine, provider } = await createStandaloneCommitEngine();
 *   const { fragment, completions } = await engine.analyze("fe", 2);
 */

import { lint, load } from "@commitlint/core";
import type { QualifiedConfig } from "@commitlint/types";
import { ConsoleNode } from "../console_node.ts";
import { PromptEngine } from "../prompt_engine.ts";
import type {
  CompletionItem,
  FragmentContext,
  TextFragment,
} from "../types.ts";

// ---------------------------------------------------------------------------
// CommitContext
// ---------------------------------------------------------------------------

interface CommitContext extends Record<string, string> {
  type: string;
  scope: string;
  separator: string;
  subject: string;
}

// ---------------------------------------------------------------------------
// CommitlintProvider
// ---------------------------------------------------------------------------

const TYPE_DESCRIPTIONS: Record<string, string> = {
  feat:     "✨ New feature",
  fix:      "🐛 Bug fix",
  docs:     "📝 Documentation",
  style:    "💄 Formatting / styling",
  refactor: "♻️  Code refactoring",
  test:     "✅ Add / fix tests",
  chore:    "🔧 Maintenance",
  perf:     "⚡ Performance improvement",
  ci:       "👷 CI/CD changes",
  build:    "📦 Build system",
  revert:   "⏪ Revert changes",
};

class CommitlintProvider {
  private config: QualifiedConfig | null = null;

  async init(userConfig?: Parameters<typeof load>[0]): Promise<void> {
    this.config = await load(
      userConfig ?? { extends: ["@commitlint/config-conventional"] },
    );
  }

  getTypes(prefix: string): CompletionItem[] {
    const types = (this.config?.rules["type-enum"]?.[2] as string[] | undefined) ?? [];
    return types
      .filter((t) => t.startsWith(prefix))
      .map((t) => ({
        matchValue: t,
        unmatchedValue: t.slice(prefix.length),
        description: TYPE_DESCRIPTIONS[t] ?? t,
      }));
  }

  getScopes(input: string): CompletionItem[] {
    const rule = this.config?.rules["scope-enum"];
    if (!rule || rule[0] === 0) return [];
    const scopes = (rule[2] as string[] | undefined) ?? [];
    const prefix = input.replace(/^\(/, "");
    return scopes
      .filter((s) => s.startsWith(prefix))
      .map((s) => ({
        matchValue: `(${s})`,
        unmatchedValue: s.slice(prefix.length) + ")",
        description: s,
      }));
  }

  async validate(message: string) {
    if (!this.config) return { valid: true, errors: [], warnings: [] };
    const result = await lint(message, this.config.rules, {
      parserOpts: this.config.parserPreset?.parserOpts as never,
    });
    return {
      valid: result.valid,
      errors: result.errors.map((e) => e.message),
      warnings: result.warnings.map((w) => w.message),
    };
  }
}

// ---------------------------------------------------------------------------
// Ghost text ヘルパー (TypeNode / ScopeNode で共通)
// ---------------------------------------------------------------------------

function renderWithGhost(ctx: FragmentContext): TextFragment[] {
  const { value, isPrimary, selectIndex, completions } = ctx;
  const frags: TextFragment[] = [
    {
      text: value,
      role: "primary",
      isEditable: true,
      isLocked: false,
      isIncludeInOutput: true,
    },
  ];
  if (isPrimary) {
    const ghost = completions[selectIndex]?.unmatchedValue;
    if (ghost) {
      frags.push({
        text: ghost,
        role: "ghost",
        isEditable: false,
        isLocked: false,
        isIncludeInOutput: false,
      });
    }
  }
  return frags;
}

// ---------------------------------------------------------------------------
// Nodes
// ---------------------------------------------------------------------------

class TypeNode extends ConsoleNode<CommitContext> {
  override id = "type" as const;

  constructor(private provider: CommitlintProvider) {
    super([
      { to: "scope",     trigger: /^\w+(?=\()/ },
      { to: "separator", trigger: /^\w+(?=!?:)/ },
      { to: "type",      trigger: /^\w+/ },
    ]);
  }

  override getSuggestions(input: string): Promise<CompletionItem[]> {
    return Promise.resolve(this.provider.getTypes(input));
  }

  override render(ctx: FragmentContext): TextFragment[] {
    return renderWithGhost(ctx);
  }
}

class ScopeNode extends ConsoleNode<CommitContext> {
  override id = "scope" as const;

  constructor(private provider: CommitlintProvider) {
    super([
      { to: "separator", trigger: /^\([^)]+\)(?=!?:)/ },
      { to: "scope",     trigger: /^\([^)]*/ },
    ]);
  }

  override getSuggestions(input: string): Promise<CompletionItem[]> {
    return Promise.resolve(this.provider.getScopes(input));
  }

  override render(ctx: FragmentContext): TextFragment[] {
    return renderWithGhost(ctx);
  }
}

class SeparatorNode extends ConsoleNode<CommitContext> {
  override id = "separator" as const;

  constructor() {
    super([{ to: "subject", trigger: /^!?:\s*/ }]);
  }

  override getSuggestions(): Promise<CompletionItem[]> {
    return Promise.resolve([]);
  }
}

class SubjectNode extends ConsoleNode<CommitContext> {
  override id = "subject" as const;

  constructor(private maxLen = 72) {
    super([{ to: "subject", trigger: /^[\s\S]+/ }]);
  }

  override getSuggestions(): Promise<CompletionItem[]> {
    return Promise.resolve([]);
  }

  /** 文字数カウンターを meta フラグメントとして付加 */
  override render(ctx: FragmentContext): TextFragment[] {
    const len = ctx.value.length;
    const over = len > this.maxLen;
    return [
      {
        text: ctx.value,
        role: over ? "error" : "primary",
        isEditable: true,
        isLocked: false,
        isIncludeInOutput: true,
      },
      {
        text: ` (${len}/${this.maxLen})`,
        role: over ? "error" : "meta",
        isEditable: false,
        isLocked: true,
        isIncludeInOutput: false,
      },
    ];
  }
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

export async function createStandaloneCommitEngine(
  userConfig?: Parameters<typeof load>[0],
): Promise<{ engine: PromptEngine<CommitContext>; provider: CommitlintProvider }> {
  const provider = new CommitlintProvider();
  await provider.init(userConfig);

  const engine = new PromptEngine<CommitContext>(
    [
      new TypeNode(provider),
      new ScopeNode(provider),
      new SeparatorNode(),
      new SubjectNode(),
    ],
    "type",
  );

  return { engine, provider };
}

// ---------------------------------------------------------------------------
// Demo
// ---------------------------------------------------------------------------

const { engine, provider } = await createStandaloneCommitEngine({
  extends: ["@commitlint/config-conventional"],
  rules: {
    // scope-enum を追加すると scope 補完も動く
    "scope-enum": [1, "always", ["api", "auth", "ui", "db"]],
  },
});

const cases = [
  { label: "type 途中 'fe'",              input: "fe",                    cursor: 2  },
  { label: "type 確定 'feat'",            input: "feat",                  cursor: 4  },
  { label: "scope 途中 'feat(ap'",        input: "feat(ap",               cursor: 7  },
  { label: "scope 確定 'feat(api): '",    input: "feat(api): ",           cursor: 11 },
  { label: "subject 入力 'feat: add x'",  input: "feat: add x",           cursor: 11 },
  { label: "breaking 'feat!: '",          input: "feat!: ",               cursor: 7  },
  { label: "長い subject (75文字超え)",    input: "feat: " + "a".repeat(75), cursor: 81 },
];

console.log("=== スタンドアロン commitlint エンジン デモ ===\n");

for (const { label, input, cursor } of cases) {
  const { fragment, completions } = await engine.analyze(input, cursor, 0);

  console.log(`📝 ${label}`);

  // フラグメント表示
  const rendered = fragment
    .map((f) => {
      if (f.role === "ghost")  return `\x1b[2m${f.text}\x1b[0m`; // dim
      if (f.role === "error")  return `\x1b[31m${f.text}\x1b[0m`; // red
      if (f.role === "meta")   return `\x1b[90m${f.text}\x1b[0m`; // gray
      return f.text;
    })
    .join("");
  console.log(`   レンダリング: ${rendered}`);

  // 補完候補
  if (completions.length > 0) {
    console.log("   補完候補:");
    for (const c of completions.slice(0, 4)) {
      console.log(`     → "${c.matchValue}"  ${c.description}`);
    }
  } else {
    console.log("   補完候補: なし");
  }

  // バリデーション
  const v = await provider.validate(input.trim());
  if (!v.valid)             console.log(`   ❌ ${v.errors.join(" / ")}`);
  else if (v.warnings.length) console.log(`   ⚠️  ${v.warnings.join(" / ")}`);

  console.log();
}
