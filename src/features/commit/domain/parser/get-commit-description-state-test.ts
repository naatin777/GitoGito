import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { getCommitDescriptionState } from "./get-commit-description-state.ts";

describe("getCommitDescriptionState", () => {
  describe("Basic description editing", () => {
    it("User starts typing description after colon", () => {
      // "feat: |"
      const input = "feat: ";
      const situation = getCommitDescriptionState(input, 6);
      assertEquals(situation, "editing_description");
    });

    it("User typing description", () => {
      // "feat: add |new feature"
      const input = "feat: add new feature";
      const situation = getCommitDescriptionState(input, 10);
      assertEquals(situation, "editing_description");
    });

    it("User at the end of description", () => {
      // "feat: add new feature|"
      const input = "feat: add new feature";
      const situation = getCommitDescriptionState(input, 21);
      assertEquals(situation, "editing_description");
    });

    it("User with scope typing description", () => {
      // "feat(api): add |endpoint"
      const input = "feat(api): add endpoint";
      const situation = getCommitDescriptionState(input, 15);
      assertEquals(situation, "editing_description");
    });
  });

  describe("Code block editing with backticks", () => {
    it("User opened code block with single backtick", () => {
      // "feat: add `|"
      const input = "feat: add `";
      const situation = getCommitDescriptionState(input, 11);
      assertEquals(situation, "editing_code");
    });

    it("User typing inside code block", () => {
      // "feat: add `cod|e"
      const input = "feat: add `code";
      const situation = getCommitDescriptionState(input, 14);
      assertEquals(situation, "editing_code");
    });

    it("User closed code block (back to description)", () => {
      // "feat: add `code`|"
      const input = "feat: add `code`";
      const situation = getCommitDescriptionState(input, 16);
      assertEquals(situation, "editing_description");
    });

    it("User typing after closed code block", () => {
      // "feat: add `code` to |project"
      const input = "feat: add `code` to project";
      const situation = getCommitDescriptionState(input, 20);
      assertEquals(situation, "editing_description");
    });

    it("User opened second code block", () => {
      // "feat: add `code` and `|"
      const input = "feat: add `code` and `";
      const situation = getCommitDescriptionState(input, 22);
      assertEquals(situation, "editing_code");
    });

    it("User with multiple closed code blocks", () => {
      // "feat: add `code` and `test`|"
      const input = "feat: add `code` and `test`";
      const situation = getCommitDescriptionState(input, 27);
      assertEquals(situation, "editing_description");
    });

    it("User typing between code blocks", () => {
      // "feat: add `code`| and `test`"
      const input = "feat: add `code` and `test`";
      const situation = getCommitDescriptionState(input, 16);
      assertEquals(situation, "editing_description");
    });
  });

  describe("Tag editing with square brackets", () => {
    it("User opened tag with opening bracket", () => {
      // "feat: add feature [|"
      const input = "feat: add feature [";
      const situation = getCommitDescriptionState(input, 19);
      assertEquals(situation, "editing_tag");
    });

    it("User typing inside tag", () => {
      // "feat: add feature [WIP|"
      const input = "feat: add feature [WIP";
      const situation = getCommitDescriptionState(input, 22);
      assertEquals(situation, "editing_tag");
    });

    it("User closed tag (back to description)", () => {
      // "feat: add feature [WIP]|"
      const input = "feat: add feature [WIP]";
      const situation = getCommitDescriptionState(input, 23);
      assertEquals(situation, "editing_description");
    });

    it("User typing after closed tag", () => {
      // "feat: add feature [WIP] for |testing"
      const input = "feat: add feature [WIP] for testing";
      const situation = getCommitDescriptionState(input, 28);
      assertEquals(situation, "editing_description");
    });

    it("User opened second tag", () => {
      // "feat: add [feature] and [|"
      const input = "feat: add [feature] and [";
      const situation = getCommitDescriptionState(input, 25);
      assertEquals(situation, "editing_tag");
    });

    it("User with multiple closed tags", () => {
      // "feat: add [feature] and [test]|"
      const input = "feat: add [feature] and [test]";
      const situation = getCommitDescriptionState(input, 30);
      assertEquals(situation, "editing_description");
    });

    it("User typing between tags", () => {
      // "feat: add [feature]| and [test]"
      const input = "feat: add [feature] and [test]";
      const situation = getCommitDescriptionState(input, 19);
      assertEquals(situation, "editing_description");
    });

    it("User editing inside first tag when multiple tags exist", () => {
      // "feat: add [fea|ture] and [test]"
      const input = "feat: add [feature] and [test]";
      const situation = getCommitDescriptionState(input, 14);
      assertEquals(situation, "editing_description");
    });
  });

  describe("Complex scenarios with code and tags", () => {
    it("User with code block and tag (both closed)", () => {
      // "feat: add `code` [WIP]|"
      const input = "feat: add `code` [WIP]";
      const situation = getCommitDescriptionState(input, 22);
      assertEquals(situation, "editing_description");
    });

    it("User with tag inside unclosed code block (code takes priority)", () => {
      // "feat: add `code [WIP|"
      const input = "feat: add `code [WIP";
      const situation = getCommitDescriptionState(input, 20);
      assertEquals(situation, "editing_code");
    });

    it("User with code inside closed tag (tag comes after)", () => {
      // "feat: add [tag] `code|"
      const input = "feat: add [tag] `code";
      const situation = getCommitDescriptionState(input, 21);
      assertEquals(situation, "editing_code");
    });

    it("User with tag after closed code block, tag is open", () => {
      // "feat: add `code` [WIP|"
      const input = "feat: add `code` [WIP";
      const situation = getCommitDescriptionState(input, 21);
      assertEquals(situation, "editing_tag");
    });

    it("User with multiple code blocks and tags", () => {
      // "feat: add `code` [WIP] and `test` [DONE]|"
      const input = "feat: add `code` [WIP] and `test` [DONE]";
      const situation = getCommitDescriptionState(input, 41);
      assertEquals(situation, "editing_description");
    });
  });

  describe("Edge cases", () => {
    it("Empty description after colon", () => {
      // "feat:|"
      const input = "feat:";
      const situation = getCommitDescriptionState(input, 5);
      assertEquals(situation, "editing_description");
    });

    it("Description with only spaces", () => {
      // "feat:   |"
      const input = "feat:   ";
      const situation = getCommitDescriptionState(input, 8);
      assertEquals(situation, "editing_description");
    });

    it("Empty tag brackets", () => {
      // "feat: add []|"
      const input = "feat: add []";
      const situation = getCommitDescriptionState(input, 12);
      assertEquals(situation, "editing_description");
    });

    it("Empty code backticks", () => {
      // "feat: add ``|"
      const input = "feat: add ``";
      const situation = getCommitDescriptionState(input, 12);
      assertEquals(situation, "editing_description");
    });

    it("Single backtick at the end", () => {
      // "feat: add feature`|"
      const input = "feat: add feature`";
      const situation = getCommitDescriptionState(input, 18);
      assertEquals(situation, "editing_code");
    });

    it("Single bracket at the end", () => {
      // "feat: add feature[|"
      const input = "feat: add feature[";
      const situation = getCommitDescriptionState(input, 18);
      assertEquals(situation, "editing_tag");
    });
  });
});
