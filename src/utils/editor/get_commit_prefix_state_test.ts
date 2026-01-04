import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { getCommitPrefixState } from "./get_commit_prefix_state.ts";

describe("User Situation", () => {
  it("User start typing 'type'", () => {
    // "|"
    const input = "";
    const situation = getCommitPrefixState(input, 0);
    assertEquals(situation, "editing_type");
  });

  it("User start typing 'type'", () => {
    // "|fe"
    const input = "fe";
    const situation = getCommitPrefixState(input, 0);
    assertEquals(situation, "editing_type");
  });

  it("User typing 'type' (partial)", () => {
    // "fe|"
    const input = "fe";
    const situation = getCommitPrefixState(input, 2);
    assertEquals(situation, "editing_type");
  });

  it("User finished typing 'type' (waiting for next)", () => {
    // "feat|"
    const input = "feat";
    const situation = getCommitPrefixState(input, 4);
    assertEquals(situation, "waiting_scope_or_colon");
  });

  it("User finished typing 'type' (waiting for next)", () => {
    // "fe|at"
    const input = "feat";
    const situation = getCommitPrefixState(input, 2);
    assertEquals(situation, "editing_type");
  });

  it("User finished typing 'type' (waiting for next)", () => {
    // "feat |"
    const input = "feat ";
    const situation = getCommitPrefixState(input, 5);
    assertEquals(situation, "waiting_scope_or_colon");
  });

  it("User added breaking mark without scope", () => {
    // "feat!|"
    const input = "feat!";
    const situation = getCommitPrefixState(input, 5);
    assertEquals(situation, "waiting_colon");
  });

  it("User added breaking mark without scope", () => {
    // "feat|!"
    const input = "feat!";
    const situation = getCommitPrefixState(input, 4);
    assertEquals(situation, "waiting_colon");
  });

  it("User just opened scope parenthesis", () => {
    // "feat(|"
    const input = "feat(";
    const situation = getCommitPrefixState(input, 5);
    assertEquals(situation, "editing_scope");
  });

  it("User typing inside scope", () => {
    // "feat(ap|"
    const input = "feat(ap";
    const situation = getCommitPrefixState(input, 7);
    assertEquals(situation, "editing_scope");
  });

  it("User closed scope (waiting for colon)", () => {
    // "feat(api)|"
    const input = "feat(api)";
    const situation = getCommitPrefixState(input, 9);
    assertEquals(situation, "waiting_colon");
  });

  it("User added breaking change mark (waiting for colon)", () => {
    // "feat(api)!|"
    const input = "feat(api)!";
    const situation = getCommitPrefixState(input, 10);
    assertEquals(situation, "waiting_colon");
  });
});
