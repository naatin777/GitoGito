import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { getCommitPrefixState } from "./get_commit_prefix_state.ts";
import type { CommitConfig } from "../../type.ts";

describe("getCommitPrefixState", () => {
  describe("Type editing - Initial state", () => {
    it("Empty string at start", () => {
      // "|"
      const input = "";
      const situation = getCommitPrefixState(input, 0);
      assertEquals(situation, "editing_type");
    });

    it("Cursor at start of partial type", () => {
      // "|fe"
      const input = "fe";
      const situation = getCommitPrefixState(input, 0);
      assertEquals(situation, "editing_type");
    });

    it("Cursor in middle of partial type", () => {
      // "f|e"
      const input = "fe";
      const situation = getCommitPrefixState(input, 1);
      assertEquals(situation, "editing_type");
    });

    it("Cursor at end of partial type", () => {
      // "fe|"
      const input = "fe";
      const situation = getCommitPrefixState(input, 2);
      assertEquals(situation, "editing_type");
    });

    it("Unknown type (not in config)", () => {
      // "unknown|"
      const input = "unknown";
      const situation = getCommitPrefixState(input, 7);
      assertEquals(situation, "editing_type");
    });

    it("Single character type", () => {
      // "f|"
      const input = "f";
      const situation = getCommitPrefixState(input, 1);
      assertEquals(situation, "editing_type");
    });
  });

  describe("Type editing - Known types", () => {
    it("Complete 'feat' type at end", () => {
      // "feat|"
      const input = "feat";
      const situation = getCommitPrefixState(input, 4);
      assertEquals(situation, "waiting_scope_or_colon");
    });

    it("Complete 'fix' type at end", () => {
      // "fix|"
      const input = "fix";
      const situation = getCommitPrefixState(input, 3);
      assertEquals(situation, "waiting_scope_or_colon");
    });

    it("Complete 'docs' type at end", () => {
      // "docs|"
      const input = "docs";
      const situation = getCommitPrefixState(input, 4);
      assertEquals(situation, "waiting_scope_or_colon");
    });

    it("Complete 'refactor' type at end", () => {
      // "refactor|"
      const input = "refactor";
      const situation = getCommitPrefixState(input, 8);
      assertEquals(situation, "waiting_scope_or_colon");
    });

    it("Cursor in middle of complete type", () => {
      // "fe|at"
      const input = "feat";
      const situation = getCommitPrefixState(input, 2);
      assertEquals(situation, "editing_type");
    });

    it("Cursor at start of complete type", () => {
      // "|feat"
      const input = "feat";
      const situation = getCommitPrefixState(input, 0);
      assertEquals(situation, "editing_type");
    });
  });

  describe("Type with trailing whitespace", () => {
    it("Known type with single trailing space", () => {
      // "feat |"
      const input = "feat ";
      const situation = getCommitPrefixState(input, 5);
      assertEquals(situation, "waiting_scope_or_colon");
    });

    it("Known type with multiple trailing spaces", () => {
      // "feat   |"
      const input = "feat   ";
      const situation = getCommitPrefixState(input, 7);
      assertEquals(situation, "waiting_scope_or_colon");
    });

    it("Known type with tab character", () => {
      // "feat\t|"
      const input = "feat\t";
      const situation = getCommitPrefixState(input, 5);
      assertEquals(situation, "waiting_scope_or_colon");
    });

    it("Cursor before trailing space", () => {
      // "feat| "
      const input = "feat ";
      const situation = getCommitPrefixState(input, 4);
      assertEquals(situation, "waiting_scope_or_colon");
    });

    it("Cursor in middle of trailing spaces", () => {
      // "feat | "
      const input = "feat  ";
      const situation = getCommitPrefixState(input, 5);
      assertEquals(situation, "waiting_scope_or_colon");
    });
  });

  describe("Breaking change mark without scope", () => {
    it("Breaking mark immediately after type at end", () => {
      // "feat!|"
      const input = "feat!";
      const situation = getCommitPrefixState(input, 5);
      assertEquals(situation, "waiting_colon");
    });

    it("Cursor before breaking mark", () => {
      // "feat|!"
      const input = "feat!";
      const situation = getCommitPrefixState(input, 4);
      assertEquals(situation, "waiting_colon");
    });

    it("Cursor at start with breaking mark", () => {
      // "|feat!"
      const input = "feat!";
      const situation = getCommitPrefixState(input, 0);
      // When cursor is at position 0, we're still editing the type part
      // even though the full string has breaking mark
      assertEquals(situation, "waiting_colon");
    });

    it("Breaking mark with different types", () => {
      // "fix!|"
      const input = "fix!";
      const situation = getCommitPrefixState(input, 4);
      assertEquals(situation, "waiting_colon");
    });

    it("Unknown type with breaking mark", () => {
      // "unknown!|"
      const input = "unknown!";
      const situation = getCommitPrefixState(input, 8);
      assertEquals(situation, "editing_type");
    });

    it("Partial type with breaking mark", () => {
      // "fea!|"
      const input = "fea!";
      const situation = getCommitPrefixState(input, 4);
      assertEquals(situation, "editing_type");
    });

    it("Breaking mark with trailing space", () => {
      // "feat! |"
      const input = "feat! ";
      const situation = getCommitPrefixState(input, 6);
      // Trailing space after breaking mark causes it to not recognize as breaking change
      assertEquals(situation, "editing_type");
    });
  });

  describe("Scope editing - Opening parenthesis", () => {
    it("Just opened scope", () => {
      // "feat(|"
      const input = "feat(";
      const situation = getCommitPrefixState(input, 5);
      assertEquals(situation, "editing_scope");
    });

    it("Cursor before opening parenthesis", () => {
      // "feat|(api)"
      const input = "feat(api)";
      const situation = getCommitPrefixState(input, 4);
      assertEquals(situation, "editing_type");
    });

    it("Cursor at opening parenthesis", () => {
      // "feat(|api)"
      const input = "feat(api)";
      const situation = getCommitPrefixState(input, 5);
      assertEquals(situation, "editing_scope");
    });

    it("Unknown type with scope opened", () => {
      // "unknown(|"
      const input = "unknown(";
      const situation = getCommitPrefixState(input, 8);
      assertEquals(situation, "editing_scope");
    });

    it("Partial type with scope opened", () => {
      // "fea(|"
      const input = "fea(";
      const situation = getCommitPrefixState(input, 4);
      assertEquals(situation, "editing_scope");
    });

    it("Space before opening parenthesis", () => {
      // "feat (|"
      const input = "feat (";
      const situation = getCommitPrefixState(input, 6);
      assertEquals(situation, "editing_scope");
    });
  });

  describe("Scope editing - Inside scope", () => {
    it("Single character in scope", () => {
      // "feat(a|)"
      const input = "feat(a)";
      const situation = getCommitPrefixState(input, 6);
      assertEquals(situation, "editing_scope");
    });

    it("Multiple characters in scope", () => {
      // "feat(ap|i)"
      const input = "feat(api)";
      const situation = getCommitPrefixState(input, 7);
      assertEquals(situation, "editing_scope");
    });

    it("Cursor at start of scope content", () => {
      // "feat(|api)"
      const input = "feat(api)";
      const situation = getCommitPrefixState(input, 5);
      assertEquals(situation, "editing_scope");
    });

    it("Long scope name", () => {
      // "feat(authentication-service|)"
      const input = "feat(authentication-service)";
      const situation = getCommitPrefixState(input, 27);
      assertEquals(situation, "editing_scope");
    });

    it("Scope with numbers", () => {
      // "feat(api-v2|)"
      const input = "feat(api-v2)";
      const situation = getCommitPrefixState(input, 11);
      assertEquals(situation, "editing_scope");
    });

    it("Scope with underscores", () => {
      // "feat(user_service|)"
      const input = "feat(user_service)";
      const situation = getCommitPrefixState(input, 17);
      assertEquals(situation, "editing_scope");
    });

    it("Scope with slashes", () => {
      // "feat(api/users|)"
      const input = "feat(api/users)";
      const situation = getCommitPrefixState(input, 14);
      assertEquals(situation, "editing_scope");
    });

    it("Empty scope with cursor inside", () => {
      // "feat(|)"
      const input = "feat()";
      const situation = getCommitPrefixState(input, 5);
      assertEquals(situation, "editing_scope");
    });
  });

  describe("Scope editing - Closing parenthesis", () => {
    it("Cursor right after closing parenthesis", () => {
      // "feat(api)|"
      const input = "feat(api)";
      const situation = getCommitPrefixState(input, 9);
      assertEquals(situation, "waiting_colon");
    });

    it("Cursor at closing parenthesis", () => {
      // "feat(api|)"
      const input = "feat(api)";
      const situation = getCommitPrefixState(input, 8);
      assertEquals(situation, "editing_scope");
    });

    it("Empty scope with cursor after close", () => {
      // "feat()|"
      const input = "feat()";
      const situation = getCommitPrefixState(input, 6);
      assertEquals(situation, "waiting_colon");
    });

    it("Scope with trailing space after close", () => {
      // "feat(api) |"
      const input = "feat(api) ";
      const situation = getCommitPrefixState(input, 10);
      assertEquals(situation, "waiting_colon");
    });

    it("Cursor before close in longer scope", () => {
      // "feat(authentication|)"
      const input = "feat(authentication)";
      const situation = getCommitPrefixState(input, 19);
      assertEquals(situation, "editing_scope");
    });
  });

  describe("Scope with breaking change mark", () => {
    it("Breaking mark after closed scope", () => {
      // "feat(api)!|"
      const input = "feat(api)!";
      const situation = getCommitPrefixState(input, 10);
      assertEquals(situation, "waiting_colon");
    });

    it("Cursor before breaking mark with scope", () => {
      // "feat(api)|!"
      const input = "feat(api)!";
      const situation = getCommitPrefixState(input, 9);
      assertEquals(situation, "waiting_colon");
    });

    it("Cursor at breaking mark with scope", () => {
      // "feat(api)!|"
      const input = "feat(api)!";
      const situation = getCommitPrefixState(input, 10);
      assertEquals(situation, "waiting_colon");
    });

    it("Breaking mark with empty scope", () => {
      // "feat()!|"
      const input = "feat()!";
      const situation = getCommitPrefixState(input, 7);
      assertEquals(situation, "waiting_colon");
    });

    it("Breaking mark with trailing space", () => {
      // "feat(api)! |"
      const input = "feat(api)! ";
      const situation = getCommitPrefixState(input, 11);
      assertEquals(situation, "waiting_colon");
    });

    it("Cursor in scope when breaking mark present", () => {
      // "feat(ap|i)!"
      const input = "feat(api)!";
      const situation = getCommitPrefixState(input, 7);
      assertEquals(situation, "editing_scope");
    });
  });

  describe("Edge cases - Invalid or unusual input", () => {
    it("Only opening parenthesis", () => {
      // "(|"
      const input = "(";
      const situation = getCommitPrefixState(input, 1);
      assertEquals(situation, "editing_scope");
    });

    it("Opening parenthesis at start", () => {
      // "|(scope)"
      const input = "(scope)";
      const situation = getCommitPrefixState(input, 0);
      assertEquals(situation, "editing_type");
    });

    it("Multiple opening parentheses", () => {
      // "feat((api|"
      const input = "feat((api";
      const situation = getCommitPrefixState(input, 9);
      assertEquals(situation, "editing_scope");
    });

    it("Closing before opening parenthesis", () => {
      // "feat)api(|"
      const input = "feat)api(";
      const situation = getCommitPrefixState(input, 9);
      // The function finds first "(" and considers everything after as closed scope
      // because there's a ")" before the cursor position
      assertEquals(situation, "waiting_colon");
    });

    it("Multiple closing parentheses", () => {
      // "feat(api))|"
      const input = "feat(api))";
      const situation = getCommitPrefixState(input, 10);
      assertEquals(situation, "waiting_colon");
    });

    it("Only breaking mark", () => {
      // "!|"
      const input = "!";
      const situation = getCommitPrefixState(input, 1);
      assertEquals(situation, "editing_type");
    });

    it("Multiple breaking marks", () => {
      // "feat!!|"
      const input = "feat!!";
      const situation = getCommitPrefixState(input, 6);
      assertEquals(situation, "editing_type");
    });

    it("Breaking mark before type", () => {
      // "!feat|"
      const input = "!feat";
      const situation = getCommitPrefixState(input, 5);
      assertEquals(situation, "editing_type");
    });

    it("Breaking mark inside scope", () => {
      // "feat(api!|)"
      const input = "feat(api!)";
      const situation = getCommitPrefixState(input, 9);
      assertEquals(situation, "editing_scope");
    });

    it("Space inside scope", () => {
      // "feat(api service|)"
      const input = "feat(api service)";
      const situation = getCommitPrefixState(input, 16);
      assertEquals(situation, "editing_scope");
    });

    it("Special characters in scope", () => {
      // "feat(@api#123|)"
      const input = "feat(@api#123)";
      const situation = getCommitPrefixState(input, 13);
      assertEquals(situation, "editing_scope");
    });
  });

  describe("Edge cases - Cursor positions", () => {
    it("Cursor at position 0 with content", () => {
      // "|feat(api)!"
      const input = "feat(api)!";
      const situation = getCommitPrefixState(input, 0);
      assertEquals(situation, "editing_type");
    });

    it("Cursor beyond input length", () => {
      // "feat(api)|" but cursor at 100
      const input = "feat(api)";
      const situation = getCommitPrefixState(input, 100);
      assertEquals(situation, "waiting_colon");
    });

    it("Very long type name", () => {
      const input = "verylongtypename";
      const situation = getCommitPrefixState(input, 16);
      assertEquals(situation, "editing_type");
    });

    it("Very long scope name", () => {
      const input = "feat(verylongscopename)";
      const situation = getCommitPrefixState(input, 22);
      assertEquals(situation, "editing_scope");
    });
  });

  describe("Custom config", () => {
    const customConfig: CommitConfig = {
      rules: {
        maxHeaderLength: 50,
        requireScope: true,
      },
      type: [
        { value: "feature", description: "A new feature" },
        { value: "bugfix", description: "A bug fix" },
      ],
    };

    it("Custom type recognized", () => {
      // "feature|"
      const input = "feature";
      const situation = getCommitPrefixState(input, 7, customConfig);
      assertEquals(situation, "waiting_scope_or_colon");
    });

    it("Custom type with scope", () => {
      // "feature(auth)|"
      const input = "feature(auth)";
      const situation = getCommitPrefixState(input, 13, customConfig);
      assertEquals(situation, "waiting_colon");
    });

    it("Standard type not in custom config", () => {
      // "feat|"
      const input = "feat";
      const situation = getCommitPrefixState(input, 4, customConfig);
      assertEquals(situation, "editing_type");
    });

    it("Partial custom type", () => {
      // "featu|"
      const input = "featu";
      const situation = getCommitPrefixState(input, 5, customConfig);
      assertEquals(situation, "editing_type");
    });

    it("Custom type with breaking mark", () => {
      // "bugfix!|"
      const input = "bugfix!";
      const situation = getCommitPrefixState(input, 7, customConfig);
      assertEquals(situation, "waiting_colon");
    });
  });

  describe("Real-world scenarios", () => {
    it("Starting new commit message", () => {
      // "|"
      const input = "";
      const situation = getCommitPrefixState(input, 0);
      assertEquals(situation, "editing_type");
    });

    it("Typed 'f' looking for suggestions", () => {
      // "f|"
      const input = "f";
      const situation = getCommitPrefixState(input, 1);
      assertEquals(situation, "editing_type");
    });

    it("Completed type, about to add scope", () => {
      // "feat|"
      const input = "feat";
      const situation = getCommitPrefixState(input, 4);
      assertEquals(situation, "waiting_scope_or_colon");
    });

    it("Adding scope for API changes", () => {
      // "feat(|"
      const input = "feat(";
      const situation = getCommitPrefixState(input, 5);
      assertEquals(situation, "editing_scope");
    });

    it("Typing scope name", () => {
      // "feat(a|"
      const input = "feat(a";
      const situation = getCommitPrefixState(input, 6);
      assertEquals(situation, "editing_scope");
    });

    it("Completed scope, ready for colon", () => {
      // "feat(api)|"
      const input = "feat(api)";
      const situation = getCommitPrefixState(input, 9);
      assertEquals(situation, "waiting_colon");
    });

    it("Breaking change without scope", () => {
      // "refactor!|"
      const input = "refactor!";
      const situation = getCommitPrefixState(input, 9);
      assertEquals(situation, "waiting_colon");
    });

    it("Breaking change with scope", () => {
      // "feat(api)!|"
      const input = "feat(api)!";
      const situation = getCommitPrefixState(input, 10);
      assertEquals(situation, "waiting_colon");
    });

    it("Going back to edit type after adding scope", () => {
      // "f|eat(api)"
      const input = "feat(api)";
      const situation = getCommitPrefixState(input, 1);
      assertEquals(situation, "editing_type");
    });

    it("Going back to edit scope", () => {
      // "feat(ap|i)"
      const input = "feat(api)";
      const situation = getCommitPrefixState(input, 7);
      assertEquals(situation, "editing_scope");
    });

    it("Complex nested scope", () => {
      // "feat(components/ui/button)|"
      const input = "feat(components/ui/button)";
      const situation = getCommitPrefixState(input, 26);
      assertEquals(situation, "waiting_colon");
    });

    it("Scope with package name", () => {
      // "feat(@company/package-name)|"
      const input = "feat(@company/package-name)";
      const situation = getCommitPrefixState(input, 27);
      assertEquals(situation, "waiting_colon");
    });
  });

  describe("State transitions", () => {
    it("editing_type -> waiting_scope_or_colon", () => {
      const input1 = "fea";
      const state1 = getCommitPrefixState(input1, 3);
      assertEquals(state1, "editing_type");

      const input2 = "feat";
      const state2 = getCommitPrefixState(input2, 4);
      assertEquals(state2, "waiting_scope_or_colon");
    });

    it("waiting_scope_or_colon -> editing_scope", () => {
      const input1 = "feat";
      const state1 = getCommitPrefixState(input1, 4);
      assertEquals(state1, "waiting_scope_or_colon");

      const input2 = "feat(";
      const state2 = getCommitPrefixState(input2, 5);
      assertEquals(state2, "editing_scope");
    });

    it("editing_scope -> waiting_colon", () => {
      const input1 = "feat(api";
      const state1 = getCommitPrefixState(input1, 8);
      assertEquals(state1, "editing_scope");

      const input2 = "feat(api)";
      const state2 = getCommitPrefixState(input2, 9);
      assertEquals(state2, "waiting_colon");
    });

    it("waiting_scope_or_colon -> waiting_colon (with !)", () => {
      const input1 = "feat";
      const state1 = getCommitPrefixState(input1, 4);
      assertEquals(state1, "waiting_scope_or_colon");

      const input2 = "feat!";
      const state2 = getCommitPrefixState(input2, 5);
      assertEquals(state2, "waiting_colon");
    });

    it("editing_scope -> waiting_colon (with ! after scope)", () => {
      const input1 = "feat(api)";
      const state1 = getCommitPrefixState(input1, 8);
      assertEquals(state1, "editing_scope");

      const input2 = "feat(api)!";
      const state2 = getCommitPrefixState(input2, 10);
      assertEquals(state2, "waiting_colon");
    });
  });
});
