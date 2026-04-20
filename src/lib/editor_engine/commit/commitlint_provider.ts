/**
 * commitlint をバックエンドにしたエディタ補完プロバイダ
 *
 * - type 補完: commitlint の type-enum ルールから候補を生成
 * - scope 補完: commitlint の scope-enum ルールから候補を生成
 * - リアルタイムバリデーション: lint() で現在の入力をその場で検証
 *
 * 使い方:
 *   const engine = await createCommitEngineWithLint();
 *   const { fragment, completions } = await engine.analyze("fe", 2);
 */

import { lint, load } from "@commitlint/core";
import type { QualifiedConfig } from "@commitlint/types";
import { PromptEngine } from "../prompt_engine.ts";
import type { CompletionItem } from "../types.ts";
import type { CommitContext } from "./context.ts";
import { ScopeNode } from "./scope.ts";
import { SeparatorNode } from "./separator.ts";
import { SubjectNode } from "./subject.ts";
import { TypeNode } from "./type.ts";

const TYPE_DESCRIPTIONS: Record<string, string> = {
  feat: "✨ New feature",
  fix: "🐛 Bug fix",
  docs: "📝 Documentation",
  style: "💄 Formatting / styling",
  refactor: "♻️  Code refactoring",
  test: "✅ Add / fix tests",
  chore: "🔧 Maintenance",
  perf: "⚡ Performance improvement",
  ci: "👷 CI/CD changes",
  build: "📦 Build system",
  revert: "⏪ Revert changes",
};

// ---------------------------------------------------------------------------
// CommitlintProvider
// ---------------------------------------------------------------------------

export class CommitlintProvider {
  private config: QualifiedConfig | null = null;

  async init(userConfig?: Parameters<typeof load>[0]): Promise<void> {
    this.config = await load(
      userConfig ?? { extends: ["@commitlint/config-conventional"] },
    );
  }

  /** type-enum ルールから prefix に前方一致する補完候補を返す */
  getTypes(prefix: string): CompletionItem[] {
    if (!this.config) return [];
    const rule = this.config.rules["type-enum"];
    const types = (rule?.[2] as string[] | undefined) ?? [];
    return types
      .filter((t) => t.startsWith(prefix))
      .map((t) => ({
        matchValue: t,
        unmatchedValue: t.slice(prefix.length),
        description: TYPE_DESCRIPTIONS[t] ?? t,
      }));
  }

  /** scope-enum ルールから prefix に前方一致する補完候補を返す
   *  ScopeNode の入力は "(api" のように先頭に "(" が付く */
  getScopes(input: string): CompletionItem[] {
    if (!this.config) return [];
    const rule = this.config.rules["scope-enum"];
    if (!rule || rule[0] === 0) return []; // rule disabled
    const scopes = (rule[2] as string[] | undefined) ?? [];
    const prefix = input.replace(/^\(/, ""); // "(" を除去してプレフィックスを取り出す
    return scopes
      .filter((s) => s.startsWith(prefix))
      .map((s) => ({
        matchValue: `(${s})`,
        unmatchedValue: s.slice(prefix.length) + ")",
        description: s,
      }));
  }

  /** 現在のコミットメッセージ全体をリアルタイムでバリデーション */
  async validate(
    message: string,
  ): Promise<{ valid: boolean; errors: string[]; warnings: string[] }> {
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
// Augmented Nodes
// ---------------------------------------------------------------------------

class CommitlintTypeNode extends TypeNode {
  constructor(private provider: CommitlintProvider) {
    super();
  }

  override getSuggestions(input: string): Promise<CompletionItem[]> {
    return Promise.resolve(this.provider.getTypes(input));
  }
}

class CommitlintScopeNode extends ScopeNode {
  constructor(private provider: CommitlintProvider) {
    super();
  }

  override getSuggestions(input: string): Promise<CompletionItem[]> {
    return Promise.resolve(this.provider.getScopes(input));
  }
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

export async function createCommitEngineWithLint(
  userConfig?: Parameters<typeof load>[0],
): Promise<{ engine: PromptEngine<CommitContext>; provider: CommitlintProvider }> {
  const provider = new CommitlintProvider();
  await provider.init(userConfig);

  const engine = new PromptEngine<CommitContext>(
    [
      new CommitlintTypeNode(provider),
      new CommitlintScopeNode(provider),
      new SeparatorNode(),
      new SubjectNode(),
    ],
    "type",
  );

  return { engine, provider };
}

// ---------------------------------------------------------------------------
// Demo (bun run でそのまま動く)
// ---------------------------------------------------------------------------

const { engine, provider } = await createCommitEngineWithLint();

const cases: Array<{ label: string; input: string; cursor: number }> = [
  { label: "type 途中入力 'fe'", input: "fe", cursor: 2 },
  { label: "type 確定後 'feat'", input: "feat", cursor: 4 },
  { label: "scope 途中入力 'feat(ap'", input: "feat(ap", cursor: 7 },
  { label: "separator まで入力 'feat(api): '", input: "feat(api): ", cursor: 11 },
  { label: "subject 入力中 'feat(api): add login'", input: "feat(api): add login", cursor: 20 },
  { label: "breaking change 'feat!: '", input: "feat!: ", cursor: 7 },
];

console.log("=== commitlint バックエンド補完デモ ===\n");

for (const { label, input, cursor } of cases) {
  const { completions } = await engine.analyze(input, cursor, 0);

  console.log(`📝 ${label}`);
  console.log(`   入力: "${input}" (cursor=${cursor})`);

  if (completions.length > 0) {
    console.log("   補完候補:");
    for (const c of completions.slice(0, 5)) {
      console.log(`     → "${c.matchValue}"  ${c.description}`);
    }
  } else {
    console.log("   補完候補: なし");
  }

  const validation = await provider.validate(input.trim());
  if (!validation.valid) {
    console.log(`   ⚠️  エラー: ${validation.errors.join(", ")}`);
  } else if (validation.warnings.length > 0) {
    console.log(`   💡 警告: ${validation.warnings.join(", ")}`);
  }

  console.log();
}

// Breaking change の補完も確認
console.log("=== バリデーション単体テスト ===\n");
const messages = [
  "feat!: remove legacy API",
  "fix(auth): token refresh",
  "wip: stuff",
  "feat: " + "a".repeat(80),
];
for (const msg of messages) {
  const r = await provider.validate(msg);
  const icon = r.valid ? "✅" : "❌";
  console.log(`${icon} "${msg.slice(0, 50)}${msg.length > 50 ? "…" : ""}"`);
  if (!r.valid) console.log(`   ${r.errors.join(" / ")}`);
}
