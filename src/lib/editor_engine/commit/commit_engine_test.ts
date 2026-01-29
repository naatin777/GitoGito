// import { assertEquals } from "@std/assert";
// import type { CompletionItem, TextFragment } from "../types.ts";
// import { createCommitEngine } from "./commit_engine.ts";

// Deno.test("CommitEngine - complete conventional commit", async () => {
//   const engine = await createCommitEngine();
//   const result = await engine.analyze("feat(api): add endpoint", 2);

//   // Fragment 1: "feat" (primary - cursor here)
//   assertEquals(result.fragment[0].text, "feat");
//   assertEquals(result.fragment[0].role, "primary");
//   assertEquals(result.fragment[0].isEditable, true);
//   assertEquals(result.fragment[0].isLocked, false);
//   assertEquals(result.fragment[0].isIncludeInOutput, true);

//   // Fragment 2: "(api)" (secondary - scope with parentheses)
//   assertEquals(result.fragment[1].text, "(api)");
//   assertEquals(result.fragment[1].role, "secondary");
//   assertEquals(result.fragment[1].isEditable, true);
//   assertEquals(result.fragment[1].isLocked, false);
//   assertEquals(result.fragment[1].isIncludeInOutput, true);

//   // Fragment 3: ": " (secondary trigger - editable)
//   assertEquals(result.fragment[2].text, ": ");
//   assertEquals(result.fragment[2].role, "secondary");
//   assertEquals(result.fragment[2].isEditable, true);
//   assertEquals(result.fragment[2].isLocked, false);
//   assertEquals(result.fragment[2].isIncludeInOutput, true);

//   // Fragment 4: "add endpoint" (secondary)
//   assertEquals(result.fragment[3].text, "add endpoint");
//   assertEquals(result.fragment[3].role, "secondary");
//   assertEquals(result.fragment[3].isEditable, true);
//   assertEquals(result.fragment[3].isLocked, false);
//   assertEquals(result.fragment[3].isIncludeInOutput, true);

//   assertEquals(result.output, "feat(api): add endpoint");
// });

// Deno.test("CommitEngine - analyzes full input with cursor at start", async () => {
//   const engine = await createCommitEngine();
//   const result = await engine.analyze("feat(api): add endpoint", 0);

//   // すべてのノード（type, scope, subject）が解析される
//   const hasType = result.fragment.some((f: TextFragment) => f.text === "feat");
//   const hasScope = result.fragment.some((f: TextFragment) =>
//     f.text === "(api)"
//   );
//   const hasSubject = result.fragment.some((f: TextFragment) =>
//     f.text.includes("add endpoint")
//   );

//   assertEquals(hasType, true);
//   assertEquals(hasScope, true);
//   assertEquals(hasSubject, true);
//   assertEquals(result.output, "feat(api): add endpoint");
// });

// Deno.test("CommitEngine - breaking change without scope", async () => {
//   const engine = await createCommitEngine();
//   const result = await engine.analyze("feat!: breaking change", 5);

//   // Fragment 1: "feat" (secondary - cursor is after it)
//   assertEquals(result.fragment[0].text, "feat");
//   assertEquals(result.fragment[0].role, "secondary");
//   assertEquals(result.fragment[0].isEditable, true);
//   assertEquals(result.fragment[0].isLocked, false);
//   assertEquals(result.fragment[0].isIncludeInOutput, true);

//   // Fragment 2: "!: " (secondary trigger - editable)
//   assertEquals(result.fragment[1].text, "!: ");
//   assertEquals(result.fragment[1].role, "secondary");
//   assertEquals(result.fragment[1].isEditable, true);
//   assertEquals(result.fragment[1].isLocked, false);
//   assertEquals(result.fragment[1].isIncludeInOutput, true);

//   // Fragment 3: "breaking change" (secondary)
//   assertEquals(result.fragment[2].text, "breaking change");
//   assertEquals(result.fragment[2].role, "secondary");
//   assertEquals(result.fragment[2].isEditable, true);
//   assertEquals(result.fragment[2].isLocked, false);
//   assertEquals(result.fragment[2].isIncludeInOutput, true);

//   assertEquals(result.output, "feat!: breaking change");
// });

// Deno.test("CommitEngine - breaking change with scope", async () => {
//   const engine = await createCommitEngine();
//   const result = await engine.analyze("feat(api)!: breaking change", 8);

//   // Fragment 1: "feat" (secondary)
//   assertEquals(result.fragment[0].text, "feat");
//   assertEquals(result.fragment[0].role, "secondary");
//   assertEquals(result.fragment[0].isEditable, true);
//   assertEquals(result.fragment[0].isLocked, false);
//   assertEquals(result.fragment[0].isIncludeInOutput, true);

//   // Fragment 2: "(api)" (primary - cursor here in scope)
//   assertEquals(result.fragment[1].text, "(api)");
//   assertEquals(result.fragment[1].role, "primary");
//   assertEquals(result.fragment[1].isEditable, true);
//   assertEquals(result.fragment[1].isLocked, false);
//   assertEquals(result.fragment[1].isIncludeInOutput, true);

//   // Fragment 3: "!: " (secondary trigger - editable)
//   assertEquals(result.fragment[2].text, "!: ");
//   assertEquals(result.fragment[2].role, "secondary");
//   assertEquals(result.fragment[2].isEditable, true);
//   assertEquals(result.fragment[2].isLocked, false);
//   assertEquals(result.fragment[2].isIncludeInOutput, true);

//   // Fragment 4: "breaking change" (secondary)
//   assertEquals(result.fragment[3].text, "breaking change");
//   assertEquals(result.fragment[3].role, "secondary");
//   assertEquals(result.fragment[3].isEditable, true);
//   assertEquals(result.fragment[3].isLocked, false);
//   assertEquals(result.fragment[3].isIncludeInOutput, true);

//   assertEquals(result.output, "feat(api)!: breaking change");
// });

// Deno.test("CommitEngine - incomplete type input", async () => {
//   const engine = await createCommitEngine();
//   const result = await engine.analyze("fe", 2);

//   // Fragment 1: "fe" (primary)
//   assertEquals(result.fragment[0].text, "fe");
//   assertEquals(result.fragment[0].role, "primary");
//   assertEquals(result.fragment[0].isEditable, true);
//   assertEquals(result.fragment[0].isIncludeInOutput, true);

//   assertEquals(result.output, "fe");
// });

// Deno.test("CommitEngine - type with opening paren", async () => {
//   const engine = await createCommitEngine();
//   const result = await engine.analyze("feat(", 5);

//   // "feat(" は正しく動作する
//   // Fragment 0: "feat" (secondary)
//   // Fragment 1: "(" (primary - 空のスコープ)
//   // Fragment 2: ghost completion
//   assertEquals(result.fragment.length >= 2, true);
//   assertEquals(result.fragment[0].text, "feat");
//   assertEquals(result.fragment[0].role, "secondary");
//   assertEquals(result.fragment[1].text, "(");
//   assertEquals(result.fragment[1].role, "primary");
//   assertEquals(result.fragment[1].isEditable, true);
//   assertEquals(result.fragment[1].isLocked, false);
//   assertEquals(result.fragment[1].isIncludeInOutput, true);
//   assertEquals(result.output, "feat(");

//   // スコープの補完候補が返される
//   assertEquals(result.completions.length > 0, true);
// });

// Deno.test("CommitEngine - character counter uses meta role", async () => {
//   const engine = await createCommitEngine();
//   const result = await engine.analyze("feat: short", 11);

//   // 文字数カウンターが存在する
//   const metaFragment = result.fragment.find((f: TextFragment) =>
//     f.role === "meta"
//   );
//   assertEquals(metaFragment !== undefined, true);
//   assertEquals(metaFragment!.isIncludeInOutput, false);
//   assertEquals(metaFragment!.isLocked, true);

//   // カウンターのテキストが含まれている
//   assertEquals(metaFragment!.text.includes("/"), true);
// });

// Deno.test("CommitEngine - character counter shows error for long text", async () => {
//   const engine = await createCommitEngine();

//   // 50文字を超える長い入力
//   const longText = "a".repeat(60);
//   const result = await engine.analyze(`feat: ${longText}`, 60);

//   // error roleのフラグメントが存在する（文字数超過）
//   const errorFragment = result.fragment.find((f: TextFragment) =>
//     f.role === "error"
//   );
//   assertEquals(errorFragment !== undefined, true);
//   assertEquals(errorFragment!.isIncludeInOutput, false);
// });

// Deno.test("CommitEngine - all fragments have valid roles", async () => {
//   const engine = await createCommitEngine();
//   const result = await engine.analyze("feat(api): add endpoint", 10);

//   const validRoles = [
//     "primary",
//     "secondary",
//     "ghost",
//     "locked",
//     "placeholder",
//     "error",
//     "meta",
//   ];

//   for (const frag of result.fragment) {
//     assertEquals(frag.role !== undefined, true);
//     assertEquals(validRoles.includes(frag.role!), true);
//   }
// });

// Deno.test("CommitEngine - locked fragments are character counter only", async () => {
//   const engine = await createCommitEngine();
//   const result = await engine.analyze("feat(api): add endpoint", 20);

//   // locked roleのフラグメントは文字数カウンターのみ
//   const lockedFrags = result.fragment.filter((f: TextFragment) =>
//     f.role === "locked" || (f.isLocked && !f.isIncludeInOutput)
//   );

//   for (const frag of lockedFrags) {
//     // 文字数カウンター: isLocked: true, isIncludeInOutput: false
//     assertEquals(frag.isLocked, true);
//     assertEquals(frag.isIncludeInOutput, false);
//     // テキストには "/" が含まれる（例: " (23/50)"）
//     assertEquals(frag.text.includes("/"), true);
//   }
// });

// Deno.test("CommitEngine - output matches input", async () => {
//   const engine = await createCommitEngine();
//   const inputs = [
//     "feat: add feature",
//     "fix(ui): resolve bug",
//     "docs!: update readme",
//     "feat(api)!: breaking change",
//   ];

//   for (const input of inputs) {
//     const result = await engine.analyze(input, 5);
//     assertEquals(result.output, input);

//     // includeInOutput=trueのフラグメントを結合しても同じ
//     const reconstructed = result.fragment
//       .filter((f: TextFragment) => f.isIncludeInOutput)
//       .map((f: TextFragment) => f.text)
//       .join("");
//     assertEquals(reconstructed, input);
//   }
// });

// Deno.test("CommitEngine - theme injection", async () => {
//   const engine = await createCommitEngine();

//   const theme = engine.getTheme();
//   assertEquals(theme.primary, "cyan");
//   assertEquals(theme.secondary, "white");
//   assertEquals(theme.ghost, "gray");
//   assertEquals(theme.locked, "blue");
//   assertEquals(theme.placeholder, "dim");
//   assertEquals(theme.error, "red");
//   assertEquals(theme.meta, "gray");
// });

// Deno.test("CommitEngine - completions for partial type input", async () => {
//   const engine = await createCommitEngine();
//   const result = await engine.analyze("fe", 2);

//   // "fe" で始まるタイプの補完候補が返される
//   assertEquals(result.completions.length > 0, true);

//   // "feat" が候補に含まれる
//   const featCompletion = result.completions.find(
//     (c: CompletionItem) => c.matchValue === "fe" && c.unmatchedValue === "at",
//   );
//   assertEquals(featCompletion !== undefined, true);
//   assertEquals(featCompletion!.matchValue, "fe");
//   assertEquals(featCompletion!.unmatchedValue, "at");
//   assertEquals(featCompletion!.description, "A new feature");

//   // すべての補完候補が "fe" で始まる
//   for (const completion of result.completions as CompletionItem[]) {
//     assertEquals(completion.matchValue, "fe");
//     assertEquals(completion.unmatchedValue.length > 0, true);
//     assertEquals(
//       (completion.matchValue + completion.unmatchedValue).startsWith("fe"),
//       true,
//     );
//   }
// });

// Deno.test("CommitEngine - completions for exact type match", async () => {
//   const engine = await createCommitEngine();
//   const result = await engine.analyze("feat", 4);

//   // 完全一致の場合、基本補完 + トリガー補完が返される
//   // 最低でも4つ: "feat" 自身, ": ", "!: ", "("
//   assertEquals(result.completions.length >= 4, true);

//   // ": " への補完が含まれる
//   const colonCompletion = result.completions.find(
//     (c: CompletionItem) => c.matchValue === "feat" && c.unmatchedValue === ": ",
//   );
//   assertEquals(colonCompletion !== undefined, true);
//   assertEquals(colonCompletion!.description.includes("Subject"), true);

//   // "!: " への補完が含まれる（破壊的変更）
//   const breakingCompletion = result.completions.find(
//     (c: CompletionItem) =>
//       c.matchValue === "feat" && c.unmatchedValue === "!: ",
//   );
//   assertEquals(breakingCompletion !== undefined, true);
//   assertEquals(breakingCompletion!.description.includes("破壊的変更"), true);

//   // "(" への補完が含まれる（スコープ指定）
//   const scopeCompletion = result.completions.find(
//     (c: CompletionItem) => c.matchValue === "feat" && c.unmatchedValue === "(",
//   );
//   assertEquals(scopeCompletion !== undefined, true);
//   assertEquals(scopeCompletion!.description.includes("Scope"), true);
// });

// Deno.test("CommitEngine - completions for scope input", async () => {
//   const engine = await createCommitEngine();
//   const result = await engine.analyze("feat(ap", 7);

//   // "ap" で始まるスコープの補完候補が返される
//   assertEquals(result.completions.length > 0, true);

//   // 具体的な補完候補の中身を確認
//   // "ap" で始まるスコープには "api" などが含まれるはず
//   const hasApiCompletion = result.completions.some(
//     (c: CompletionItem) => c.matchValue === "ap" && c.unmatchedValue === "i",
//   );
//   assertEquals(hasApiCompletion, true);

//   // すべての補完候補が "ap" で始まる
//   for (const completion of result.completions as CompletionItem[]) {
//     assertEquals(completion.matchValue, "ap");
//     assertEquals(completion.unmatchedValue.length > 0, true);
//     assertEquals(completion.description.length > 0, true);
//   }
// });

// Deno.test("CommitEngine - no completions for subject", async () => {
//   const engine = await createCommitEngine();
//   const result = await engine.analyze("feat(api): add", 18);

//   // Subject ノードでは補完候補なし
//   assertEquals(result.completions.length, 0);
// });

// Deno.test("CommitEngine - cursor in middle of word (f|eat)", async () => {
//   const engine = await createCommitEngine();
//   // "feat" で cursor=1 (f|eat)
//   const result = await engine.analyze("feat", 1);

//   console.log("\n=== f|eat fragments ===");
//   console.log("Fragment count:", result.fragment.length);
//   result.fragment.forEach((f, i) => {
//     console.log(`Fragment ${i}:`, {
//       text: f.text,
//       role: f.role,
//       isEditable: f.isEditable,
//       isLocked: f.isLocked,
//       isIncludeInOutput: f.isIncludeInOutput,
//     });
//   });
//   console.log("Output:", result.output);
//   console.log("Completions:", result.completions.length);
//   if (result.completions.length > 0) {
//     console.log("First completion:", result.completions[0]);
//   }

//   // "f" が入力、"eat" が suffix
//   // 補完候補 "fix" があれば、ghost は "ix" で、"eat" が error (strikethrough) になるはず
//   assertEquals(result.fragment.length > 0, true);
// });
