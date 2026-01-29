// import { assertEquals } from "@std/assert";
// import { ConsoleNode } from "./console_node.ts";
// import { PromptEngine } from "./prompt_engine.ts";
// import { CompletionItem, TextFragment } from "./types.ts";

// // テスト用のシンプルなContext
// interface TestContext extends Record<string, string> {
//   first: string;
//   second: string;
// }

// // テスト用のシンプルなノード
// class FirstNode extends ConsoleNode<TestContext> {
//   id = "first" as const;

//   constructor() {
//     super(
//       [{ to: "second", trigger: /->/ }],
//       { placeholder: "first...", wordSeparator: /\s/ },
//     );
//   }

//   async getSuggestions(input: string): Promise<CompletionItem[]> {
//     if (input === "") {
//       return [
//         { matchValue: "", unmatchedValue: "hello", description: "Say hello" },
//         { matchValue: "", unmatchedValue: "world", description: "Say world" },
//       ];
//     }
//     return [];
//   }
// }

// class SecondNode extends ConsoleNode<TestContext> {
//   id = "second" as const;

//   constructor() {
//     super([], { placeholder: "second..." });
//   }

//   async getSuggestions(): Promise<CompletionItem[]> {
//     return [];
//   }
// }

// Deno.test("PromptEngine - complete input with cursor in first node", async () => {
//   const engine = new PromptEngine<TestContext>(
//     [new FirstNode(), new SecondNode()],
//     "first",
//   );

//   const result = await engine.analyze("hello->world", 3); // cursor in "hello"

//   // Fragment 1: "hello" (primary, editable, include in output)
//   assertEquals(result.fragment[0].text, "hello");
//   assertEquals(result.fragment[0].role, "primary");
//   assertEquals(result.fragment[0].isEditable, true);
//   assertEquals(result.fragment[0].isLocked, false);
//   assertEquals(result.fragment[0].isIncludeInOutput, true);

//   // Fragment 2: "->" (locked trigger)
//   assertEquals(result.fragment[1].text, "->");
//   assertEquals(result.fragment[1].role, "locked");
//   assertEquals(result.fragment[1].isEditable, false);
//   assertEquals(result.fragment[1].isLocked, true);
//   assertEquals(result.fragment[1].isIncludeInOutput, true);

//   // Fragment 3: "world" (secondary, not editable, include in output)
//   assertEquals(result.fragment[2].text, "world");
//   assertEquals(result.fragment[2].role, "secondary");
//   assertEquals(result.fragment[2].isEditable, true); // secondary but still marked editable
//   assertEquals(result.fragment[2].isLocked, false);
//   assertEquals(result.fragment[2].isIncludeInOutput, true);

//   // Total fragments
//   assertEquals(result.fragment.length, 3);

//   // Output check
//   assertEquals(result.output, "hello->world");
// });

// Deno.test("PromptEngine - complete input with cursor in second node", async () => {
//   const engine = new PromptEngine<TestContext>(
//     [new FirstNode(), new SecondNode()],
//     "first",
//   );

//   const result = await engine.analyze("hello->world", 10); // cursor in "world"

//   // Fragment 1: "hello" (secondary)
//   assertEquals(result.fragment[0].text, "hello");
//   assertEquals(result.fragment[0].role, "secondary");
//   assertEquals(result.fragment[0].isEditable, true);
//   assertEquals(result.fragment[0].isLocked, false);
//   assertEquals(result.fragment[0].isIncludeInOutput, true);

//   // Fragment 2: "->" (locked)
//   assertEquals(result.fragment[1].text, "->");
//   assertEquals(result.fragment[1].role, "locked");
//   assertEquals(result.fragment[1].isEditable, false);
//   assertEquals(result.fragment[1].isLocked, true);
//   assertEquals(result.fragment[1].isIncludeInOutput, true);

//   // Fragment 3: "world" (primary)
//   assertEquals(result.fragment[2].text, "world");
//   assertEquals(result.fragment[2].role, "primary");
//   assertEquals(result.fragment[2].isEditable, true);
//   assertEquals(result.fragment[2].isLocked, false);
//   assertEquals(result.fragment[2].isIncludeInOutput, true);

//   assertEquals(result.fragment.length, 3);
//   assertEquals(result.output, "hello->world");
// });

// Deno.test("PromptEngine - incomplete input at first node", async () => {
//   const engine = new PromptEngine<TestContext>(
//     [new FirstNode(), new SecondNode()],
//     "first",
//   );

//   const result = await engine.analyze("hel", 3);

//   // Fragment 1: "hel" (primary)
//   assertEquals(result.fragment[0].text, "hel");
//   assertEquals(result.fragment[0].role, "primary");
//   assertEquals(result.fragment[0].isEditable, true);
//   assertEquals(result.fragment[0].isLocked, false);
//   assertEquals(result.fragment[0].isIncludeInOutput, true);

//   assertEquals(result.fragment.length, 1);
//   assertEquals(result.output, "hel");
// });

// Deno.test("PromptEngine - incomplete input with trigger", async () => {
//   const engine = new PromptEngine<TestContext>(
//     [new FirstNode(), new SecondNode()],
//     "first",
//   );

//   const result = await engine.analyze("hello->", 7);

//   // Fragment 1: "hello" (secondary)
//   assertEquals(result.fragment[0].text, "hello");
//   assertEquals(result.fragment[0].role, "secondary");
//   assertEquals(result.fragment[0].isEditable, true);
//   assertEquals(result.fragment[0].isLocked, false);
//   assertEquals(result.fragment[0].isIncludeInOutput, true);

//   // Fragment 2: "->" (locked)
//   assertEquals(result.fragment[1].text, "->");
//   assertEquals(result.fragment[1].role, "locked");
//   assertEquals(result.fragment[1].isEditable, false);
//   assertEquals(result.fragment[1].isLocked, true);
//   assertEquals(result.fragment[1].isIncludeInOutput, true);

//   // カーソルが末尾で、次のノードは空なのでフラグメントは生成されない
//   assertEquals(result.fragment.length, 2);
//   assertEquals(result.output, "hello->");
// });

// Deno.test("PromptEngine - empty input shows no fragments initially", async () => {
//   const engine = new PromptEngine<TestContext>(
//     [new FirstNode(), new SecondNode()],
//     "first",
//   );

//   const result = await engine.analyze("", 0, 0); // select first completion

//   // 空入力の場合、analyze内でフラグメントが生成されない
//   // （render自体が呼ばれない可能性がある）
//   assertEquals(result.fragment.length, 0);
//   assertEquals(result.output, "");
// });

// Deno.test("PromptEngine - cursor at start analyzes full input", async () => {
//   const engine = new PromptEngine<TestContext>(
//     [new FirstNode(), new SecondNode()],
//     "first",
//   );

//   const result = await engine.analyze("hello->world", 0);

//   // すべてのフラグメントが生成される
//   assertEquals(result.fragment.length, 3);

//   // Fragment 1: "hello" (primary - cursor is here)
//   assertEquals(result.fragment[0].text, "hello");
//   assertEquals(result.fragment[0].role, "primary");

//   // Fragment 2: "->"
//   assertEquals(result.fragment[1].text, "->");
//   assertEquals(result.fragment[1].role, "locked");

//   // Fragment 3: "world"
//   assertEquals(result.fragment[2].text, "world");
//   assertEquals(result.fragment[2].role, "secondary");

//   assertEquals(result.output, "hello->world");
// });

// Deno.test("PromptEngine - cursor at end analyzes full input", async () => {
//   const engine = new PromptEngine<TestContext>(
//     [new FirstNode(), new SecondNode()],
//     "first",
//   );

//   const result = await engine.analyze("hello->world", 12);

//   assertEquals(result.fragment.length, 3);

//   // Fragment 1: "hello" (secondary)
//   assertEquals(result.fragment[0].text, "hello");
//   assertEquals(result.fragment[0].role, "secondary");

//   // Fragment 2: "->"
//   assertEquals(result.fragment[1].text, "->");
//   assertEquals(result.fragment[1].role, "locked");

//   // Fragment 3: "world" (primary - cursor is here)
//   assertEquals(result.fragment[2].text, "world");
//   assertEquals(result.fragment[2].role, "primary");

//   assertEquals(result.output, "hello->world");
// });

// Deno.test("PromptEngine - fragment reconstruction from includeInOutput", async () => {
//   const engine = new PromptEngine<TestContext>(
//     [new FirstNode(), new SecondNode()],
//     "first",
//   );

//   const input = "hello->world";
//   const result = await engine.analyze(input, 5);

//   // includeInOutput=true のフラグメントのみを結合
//   const reconstructed = result.fragment
//     .filter((f: TextFragment) => f.isIncludeInOutput)
//     .map((f: TextFragment) => f.text)
//     .join("");

//   assertEquals(reconstructed, input);
//   assertEquals(result.output, input);
// });

// Deno.test("PromptEngine - all fragments have required properties", async () => {
//   const engine = new PromptEngine<TestContext>(
//     [new FirstNode(), new SecondNode()],
//     "first",
//   );

//   const result = await engine.analyze("hello->world", 5);

//   for (const frag of result.fragment) {
//     // 必須プロパティ
//     assertEquals(typeof frag.text, "string");
//     assertEquals(typeof frag.isEditable, "boolean");
//     assertEquals(typeof frag.isLocked, "boolean");
//     assertEquals(typeof frag.isIncludeInOutput, "boolean");

//     // roleが設定されている
//     assertEquals(frag.role !== undefined, true);
//     assertEquals(
//       [
//         "primary",
//         "secondary",
//         "ghost",
//         "locked",
//         "placeholder",
//         "error",
//         "meta",
//       ].includes(frag.role!),
//       true,
//     );
//   }
// });

// Deno.test("PromptEngine - theme injection", async () => {
//   const customTheme = {
//     primary: "yellow",
//     secondary: "white",
//     ghost: "dim",
//     locked: "green",
//     placeholder: "gray",
//     error: "red",
//     meta: "blue",
//   };

//   const engine = new PromptEngine<TestContext>(
//     [new FirstNode(), new SecondNode()],
//     "first",
//     customTheme,
//   );

//   const theme = engine.getTheme();
//   assertEquals(theme.primary, "yellow");
//   assertEquals(theme.secondary, "white");
//   assertEquals(theme.ghost, "dim");
//   assertEquals(theme.locked, "green");
//   assertEquals(theme.placeholder, "gray");
//   assertEquals(theme.error, "red");
//   assertEquals(theme.meta, "blue");
// });
