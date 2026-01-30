import { PromptEngine } from "../prompt_engine.ts";
import type { CommitContext } from "./context.ts";
import { ScopeNode } from "./scope.ts";
import { SeparatorNode } from "./separator.ts";
import { SubjectNode } from "./subject.ts";
import { TypeNode } from "./type.ts";

export function createCommitEngine(): PromptEngine<CommitContext> {
  const nodes = [
    new TypeNode(),
    new ScopeNode(),
    new SeparatorNode(),
    new SubjectNode(),
  ];

  return new PromptEngine(nodes, "type");
}

const engine = await createCommitEngine();

console.log("=== Test 1: Incomplete type 'fea' (cursor=3, selectIndex=0) ===");
console.log(await engine.analyze("fea", 3, 0));
console.log("\n");

console.log(
  "=== Test 2: Complete type 'feat' (cursor=4, selectIndex=1 for ': ') ===",
);
console.log(await engine.analyze("feat", 4, 1));
console.log("\n");

console.log("=== Test 3: Incomplete scope '(ap' (cursor=3, selectIndex=0) ===");
console.log(await engine.analyze("feat(ap", 7, 0));
console.log("\n");

console.log("=== Test 4: Complete scope '(api)' (cursor=9) ===");
console.log(await engine.analyze("feat(api): ", 9));
console.log("\n");

console.log("=== Test 5: Subject input (cursor=15) ===");
console.log(await engine.analyze("feat(api): add ", 15));
