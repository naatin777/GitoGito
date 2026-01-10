import { assertEquals } from "@std/assert";
import { BaseCommand, type Command } from "./command.ts";

const MockFlag = {
  verbose: { value: false, description: "verbose", alias: "v" },
  force: { value: false, description: "force", alias: undefined },
};
const MockOption = {
  name: { value: "", description: "name", alias: "n" },
  type: { value: "default", description: "type", alias: undefined },
};

type MockFlagType = typeof MockFlag;
type MockOptionType = typeof MockOption;

class MockSubCommand extends BaseCommand<MockFlagType, MockOptionType> {
  name = "sub";
  description = "sub command";
  commands: Command[] = [];
  defaultFlags = MockFlag;
  defaultOptions = MockOption;

  lastExecuted: {
    consumedArgs: string[];
    remainingArgs: string[];
  } | null = null;

  override execute(
    remainingArgs: string[],
    consumedArgs: string[],
    _flags: MockFlagType,
    _options: MockOptionType,
  ): Promise<void> {
    this.lastExecuted = { remainingArgs, consumedArgs };
    return Promise.resolve();
  }
}

class MockCommand extends BaseCommand<MockFlagType, MockOptionType> {
  name = "mock";
  description = "mock command";
  commands: Command[] = [];
  defaultFlags = MockFlag;
  defaultOptions = MockOption;

  helpCalled = false;
  helpArgs: { consumedArgs: string[]; error?: string } | null = null;

  override execute(
    _remainingArgs: string[],
    _consumedArgs: string[],
    _flags: MockFlagType,
    _options: MockOptionType,
  ): Promise<void> {
    // Basic implementation
    return Promise.resolve();
  }

  override help(consumedArgs: string[], error?: string): Promise<void> {
    this.helpCalled = true;
    this.helpArgs = { consumedArgs, error };
    return Promise.resolve();
  }
}

Deno.test("BaseCommand.parseArgs - should correctly parse boolean flags", () => {
  const cmd = new MockCommand();

  const args = ["-v", "--force"];
  const parsed = cmd.parseArgs(args, MockFlag, MockOption);

  assertEquals(parsed.verbose, true);
  assertEquals(parsed.v, true);
  assertEquals(parsed.force, true);
});

Deno.test("BaseCommand.parseArgs - should correctly parse string options", () => {
  const cmd = new MockCommand();

  const args = ["-n", "my-name", "--type", "my-type"];
  const parsed = cmd.parseArgs(args, MockFlag, MockOption);

  assertEquals(parsed.name, "my-name");
  assertEquals(parsed.n, "my-name");
  assertEquals(parsed.type, "my-type");
});

Deno.test("BaseCommand.parseArgs - should use default values from flags and options", () => {
  const cmd = new MockCommand();

  const args: string[] = [];
  const parsed = cmd.parseArgs(args, MockFlag, MockOption);

  assertEquals(parsed.verbose, false);
  assertEquals(parsed.force, false);
  assertEquals(parsed.name, "");
  assertEquals(parsed.type, "default");
});

Deno.test("BaseCommand.parseArgs - should stop parsing flags after first non-flag argument (stopEarly)", () => {
  const cmd = new MockCommand();

  const args = ["arg1", "--verbose"];
  const parsed = cmd.parseArgs(args, MockFlag, MockOption);

  assertEquals(parsed.verbose, false);
  assertEquals(parsed._, ["arg1", "--verbose"]);
});

Deno.test("BaseCommand.executeSubCommand - should execute matching subcommand", async () => {
  const sub = new MockSubCommand();
  const cmd = new MockCommand();
  cmd.commands = [sub];

  const consumedArgs = ["root"];
  const remainingArgs = ["sub", "arg1"];
  const parsed = cmd.parseArgs(remainingArgs, MockFlag, MockOption);

  await cmd.executeSubCommand(
    parsed,
    consumedArgs,
    MockFlag,
    MockOption,
  );

  assertEquals(sub.lastExecuted?.consumedArgs, ["root", "sub"]);
  assertEquals(sub.lastExecuted?.remainingArgs, ["arg1"]);
});

Deno.test("BaseCommand.executeSubCommand - should pass applied flags and options to subcommand", async () => {
  const sub = new class extends MockSubCommand {
    appliedFlags: MockFlagType | null = null;
    appliedOptions: MockOptionType | null = null;

    override execute(
      _remainingArgs: string[],
      _consumedArgs: string[],
      flags: MockFlagType,
      options: MockOptionType,
    ): Promise<void> {
      this.appliedFlags = flags;
      this.appliedOptions = options;
      return Promise.resolve();
    }
  }();

  const cmd = new MockCommand();
  cmd.commands = [sub];

  const args = ["--verbose", "--name", "test", "sub", "arg1"];
  const parsed = cmd.parseArgs(args, MockFlag, MockOption);

  await cmd.executeSubCommand(
    parsed,
    ["root"],
    MockFlag,
    MockOption,
  );

  assertEquals(sub.appliedFlags?.verbose.value, true);
  assertEquals(sub.appliedOptions?.name.value, "test");
});

Deno.test("BaseCommand.executeSubCommand - should call help if subcommand not found", async () => {
  const cmd = new MockCommand();
  cmd.commands = [];

  const consumedArgs = ["root"];
  const remainingArgs = ["unknown"];
  const parsed = cmd.parseArgs(remainingArgs, MockFlag, MockOption);

  // Mock console.error to avoid noise in test output
  const originalError = console.error;
  console.error = () => {};

  try {
    await cmd.executeSubCommand(
      parsed,
      consumedArgs,
      MockFlag,
      MockOption,
    );
  } finally {
    console.error = originalError;
  }

  assertEquals(cmd.helpCalled, true);
  assertEquals(cmd.helpArgs?.consumedArgs, ["root"]);
  assertEquals(cmd.helpArgs?.error, 'Command "unknown" not found.');
});

Deno.test("BaseCommand.executeSubCommand - should call help if no subcommand provided", async () => {
  const cmd = new MockCommand();
  cmd.commands = [new MockSubCommand()];

  const consumedArgs = ["root"];
  const remainingArgs: string[] = [];
  const parsed = cmd.parseArgs(remainingArgs, MockFlag, MockOption);

  await cmd.executeSubCommand(
    parsed,
    consumedArgs,
    MockFlag,
    MockOption,
  );

  assertEquals(cmd.helpCalled, true);
  assertEquals(cmd.helpArgs?.consumedArgs, ["root"]);
});

Deno.test("BaseCommand.parseArgs - should work with empty flags and options", () => {
  class EmptyMockCommand extends BaseCommand<
    Record<string, never>,
    Record<string, never>
  > {
    name = "empty";
    description = "empty command";
    commands: Command[] = [];
    defaultFlags = {};
    defaultOptions = {};
    override execute(): Promise<void> {
      return Promise.resolve();
    }
  }

  const cmd = new EmptyMockCommand();
  const args = ["arg1", "--unknown"];
  const parsed = cmd.parseArgs(args, {}, {});

  assertEquals(parsed._, ["arg1", "--unknown"]);
});
