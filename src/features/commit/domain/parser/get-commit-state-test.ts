import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { getCommitHeaderState } from "./get-commit-state.ts";

describe("getCommitHeaderState", () => {
  describe("Prefix editing (before colon)", () => {
    it("User starts typing", () => {
      // "|"
      const input = "";
      const situation = getCommitHeaderState(input, 0);
      assertEquals(situation, "editing_type");
    });

    it("User typing type", () => {
      // "fea|"
      const input = "fea";
      const situation = getCommitHeaderState(input, 3);
      assertEquals(situation, "editing_type");
    });

    it("User finished typing type", () => {
      // "feat|"
      const input = "feat";
      const situation = getCommitHeaderState(input, 4);
      assertEquals(situation, "waiting_scope_or_colon");
    });

    it("User typing scope", () => {
      // "feat(ap|i)"
      const input = "feat(api)";
      const situation = getCommitHeaderState(input, 7);
      assertEquals(situation, "editing_scope");
    });

    it("User finished scope, waiting for colon", () => {
      // "feat(api)|"
      const input = "feat(api)";
      const situation = getCommitHeaderState(input, 9);
      assertEquals(situation, "waiting_colon");
    });

    it("User added breaking change mark", () => {
      // "feat!|"
      const input = "feat!";
      const situation = getCommitHeaderState(input, 5);
      assertEquals(situation, "waiting_colon");
    });

    it("User added breaking change mark with scope", () => {
      // "feat(api)!|"
      const input = "feat(api)!";
      const situation = getCommitHeaderState(input, 10);
      assertEquals(situation, "waiting_colon");
    });
  });

  describe("Description editing (after colon)", () => {
    it("User starts typing description", () => {
      // "feat: |"
      const input = "feat: ";
      const situation = getCommitHeaderState(input, 6);
      assertEquals(situation, "editing_description");
    });

    it("User typing description", () => {
      // "feat: add new |feature"
      const input = "feat: add new feature";
      const situation = getCommitHeaderState(input, 14);
      assertEquals(situation, "editing_description");
    });

    it("User at end of description", () => {
      // "feat: add new feature|"
      const input = "feat: add new feature";
      const situation = getCommitHeaderState(input, 21);
      assertEquals(situation, "editing_description");
    });

    it("User with scope typing description", () => {
      // "feat(api): add |endpoint"
      const input = "feat(api): add endpoint";
      const situation = getCommitHeaderState(input, 15);
      assertEquals(situation, "editing_description");
    });

    it("User typing description with breaking change", () => {
      // "feat!: remove |old API"
      const input = "feat!: remove old API";
      const situation = getCommitHeaderState(input, 14);
      assertEquals(situation, "editing_description");
    });
  });

  describe("Cursor position in prefix while colon exists", () => {
    it("User editing type with colon present", () => {
      // "f|eat: description"
      const input = "feat: description";
      const situation = getCommitHeaderState(input, 1);
      assertEquals(situation, "editing_type");
    });

    it("User at type end with colon present", () => {
      // "feat|: description"
      const input = "feat: description";
      const situation = getCommitHeaderState(input, 4);
      assertEquals(situation, "waiting_scope_or_colon");
    });

    it("User editing scope with colon present", () => {
      // "feat(ap|i): description"
      const input = "feat(api): description";
      const situation = getCommitHeaderState(input, 7);
      assertEquals(situation, "editing_scope");
    });

    it("User at colon position", () => {
      // "feat:|"
      const input = "feat:";
      const situation = getCommitHeaderState(input, 5);
      assertEquals(situation, "editing_description");
    });

    it("User right before colon", () => {
      // "feat|:"
      const input = "feat:";
      const situation = getCommitHeaderState(input, 4);
      assertEquals(situation, "waiting_scope_or_colon");
    });
  });

  describe("Code block editing in description", () => {
    it("User typing in code block", () => {
      // "feat: add `cod|e`"
      const input = "feat: add `code`";
      const situation = getCommitHeaderState(input, 14);
      assertEquals(situation, "editing_code");
    });

    it("User opened code block", () => {
      // "feat: add `|"
      const input = "feat: add `";
      const situation = getCommitHeaderState(input, 11);
      assertEquals(situation, "editing_code");
    });

    it("User closed code block", () => {
      // "feat: add `code`|"
      const input = "feat: add `code`";
      const situation = getCommitHeaderState(input, 16);
      assertEquals(situation, "editing_description");
    });
  });

  describe("Tag editing in description", () => {
    it("User typing in tag", () => {
      // "feat: add [WI|P]"
      const input = "feat: add [WIP]";
      const situation = getCommitHeaderState(input, 13);
      assertEquals(situation, "editing_tag");
    });

    it("User opened tag", () => {
      // "feat: add [|"
      const input = "feat: add [";
      const situation = getCommitHeaderState(input, 11);
      assertEquals(situation, "editing_tag");
    });

    it("User closed tag", () => {
      // "feat: add [WIP]|"
      const input = "feat: add [WIP]";
      const situation = getCommitHeaderState(input, 15);
      assertEquals(situation, "editing_description");
    });
  });

  describe("Edge cases", () => {
    it("Empty input", () => {
      // "|"
      const input = "";
      const situation = getCommitHeaderState(input, 0);
      assertEquals(situation, "editing_type");
    });

    it("Only colon", () => {
      // ":|"
      const input = ":";
      const situation = getCommitHeaderState(input, 1);
      assertEquals(situation, "editing_description");
    });

    it("Colon at start", () => {
      // ": |description"
      const input = ": description";
      const situation = getCommitHeaderState(input, 2);
      assertEquals(situation, "editing_description");
    });

    it("Multiple colons (first colon is delimiter)", () => {
      // "feat: add: new |feature"
      const input = "feat: add: new feature";
      const situation = getCommitHeaderState(input, 15);
      assertEquals(situation, "editing_description");
    });

    it("Cursor at beginning with description", () => {
      // "|feat: description"
      const input = "feat: description";
      const situation = getCommitHeaderState(input, 0);
      assertEquals(situation, "editing_type");
    });

    it("No colon in message", () => {
      // "feat(api)|"
      const input = "feat(api)";
      const situation = getCommitHeaderState(input, 9);
      assertEquals(situation, "waiting_colon");
    });

    it("Cursor beyond message length", () => {
      // "feat: test|" (cursor at 10, but input length is 10)
      const input = "feat: test";
      const situation = getCommitHeaderState(input, 10);
      assertEquals(situation, "editing_description");
    });
  });

  describe("Real-world scenarios", () => {
    it("Conventional commit without scope", () => {
      // "fix: resolve authentication |issue"
      const input = "fix: resolve authentication issue";
      const situation = getCommitHeaderState(input, 28);
      assertEquals(situation, "editing_description");
    });

    it("Conventional commit with scope", () => {
      // "feat(auth): add OAuth2 |support"
      const input = "feat(auth): add OAuth2 support";
      const situation = getCommitHeaderState(input, 23);
      assertEquals(situation, "editing_description");
    });

    it("Breaking change without scope", () => {
      // "refactor!: change API |structure"
      const input = "refactor!: change API structure";
      const situation = getCommitHeaderState(input, 22);
      assertEquals(situation, "editing_description");
    });

    it("Breaking change with scope", () => {
      // "feat(api)!: remove deprecated |endpoints"
      const input = "feat(api)!: remove deprecated endpoints";
      const situation = getCommitHeaderState(input, 30);
      assertEquals(situation, "editing_description");
    });

    it("Commit with code reference", () => {
      // "fix: update `calculateTotal` |function"
      const input = "fix: update `calculateTotal` function";
      const situation = getCommitHeaderState(input, 29);
      assertEquals(situation, "editing_description");
    });

    it("Commit with tag", () => {
      // "feat: add new feature [WIP]|"
      const input = "feat: add new feature [WIP]";
      const situation = getCommitHeaderState(input, 27);
      assertEquals(situation, "editing_description");
    });

    it("Complex commit with scope, code, and tag", () => {
      // "feat(ui)!: redesign `Button` component [BREAKING]|"
      const input = "feat(ui)!: redesign `Button` component [BREAKING]";
      const situation = getCommitHeaderState(input, 49);
      assertEquals(situation, "editing_description");
    });
  });
});
