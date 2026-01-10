import { render } from "ink-testing-library";
import { assertStringIncludes } from "@std/assert";
import { Help } from "./ui.tsx";
import type { Command } from "../../lib/command.ts";

Deno.test("Help component - basic rendering", () => {
  const { lastFrame, unmount } = render(
    <Help
      name="test-cli"
      description="A test CLI"
      consumedArgs={["test-cli"]}
      commands={[]}
      flags={{}}
      options={{}}
      error={undefined}
    />,
  );

  const output = lastFrame();
  assertStringIncludes(output!, "Name:");
  assertStringIncludes(output!, "test-cli - A test CLI");
  assertStringIncludes(output!, "Usage:");
  assertStringIncludes(output!, "test-cli");
  unmount();
});

Deno.test("Help component - error rendering", () => {
  const { lastFrame, unmount } = render(
    <Help
      name="test-cli"
      description="A test CLI"
      consumedArgs={["test-cli"]}
      commands={[]}
      flags={{}}
      options={{}}
      error="Something went wrong"
    />,
  );

  const output = lastFrame();
  assertStringIncludes(output!, "Something went wrong");
  unmount();
});

Deno.test("Help component - commands rendering", () => {
  const mockCommands: Command[] = [{
    name: "init",
    description: "Initialize project",
    commands: [],
    defaultFlags: {},
    defaultOptions: {},
    execute: async () => {},
  }];

  const { lastFrame, unmount } = render(
    <Help
      name="test-cli"
      description="A test CLI"
      consumedArgs={["test-cli"]}
      commands={mockCommands}
      flags={{}}
      options={{}}
      error={undefined}
    />,
  );

  const output = lastFrame();
  assertStringIncludes(output!, "Commands:");
  assertStringIncludes(output!, "init");
  assertStringIncludes(output!, "Initialize project");
  assertStringIncludes(output!, "[command]");
  unmount();
});

Deno.test("Help component - flags and options rendering", () => {
  const flags = {
    verbose: {
      value: false,
      description: "Enable verbose logging",
      alias: "v",
    },
  };
  const options = {
    config: {
      value: "config.json",
      description: "Path to config file",
      alias: "c",
    },
  };

  const { lastFrame, unmount } = render(
    <Help
      name="test-cli"
      description="A test CLI"
      consumedArgs={["test-cli"]}
      commands={[]}
      flags={flags}
      options={options}
      error={undefined}
    />,
  );

  const output = lastFrame();
  assertStringIncludes(output!, "Options:");
  assertStringIncludes(output!, "--verbose, -v");
  assertStringIncludes(output!, "Enable verbose logging");
  assertStringIncludes(output!, "--config=<value>, -c=<value>");
  assertStringIncludes(output!, "Path to config file");
  assertStringIncludes(output!, "test-cli [options]");
  assertStringIncludes(output!, "A test CLI");
  assertStringIncludes(output!, "Usage:");
  assertStringIncludes(output!, "test-cli [options]");
  unmount();
});

Deno.test("Help component - subCommand rendering", () => {
  const mockSubCommands: Command[] = [{
    name: "nested",
    description: "Nested command description",
    commands: [],
    defaultFlags: {},
    defaultOptions: {},
    execute: async () => {},
  }];

  const { lastFrame, unmount } = render(
    <Help
      name="sub-command"
      description="A sub command"
      consumedArgs={["test-cli", "sub-command"]}
      commands={mockSubCommands}
      flags={{}}
      options={{}}
      error={undefined}
    />,
  );

  const output = lastFrame();
  assertStringIncludes(output!, "Usage:");
  assertStringIncludes(output!, "test-cli sub-command [command]");
  assertStringIncludes(output!, "Commands:");
  assertStringIncludes(output!, "nested");
  assertStringIncludes(output!, "Nested command description");
  unmount();
});

Deno.test("Help component - flags only rendering", () => {
  const flags = {
    verbose: {
      value: false,
      description: "Enable verbose logging",
      alias: "v",
    },
  };

  const { lastFrame, unmount } = render(
    <Help
      name="test-cli"
      description="A test CLI"
      consumedArgs={["test-cli"]}
      commands={[]}
      flags={flags}
      options={{}}
      error={undefined}
    />,
  );

  const output = lastFrame();
  assertStringIncludes(output!, "Usage:");
  assertStringIncludes(output!, "test-cli [options]");
  assertStringIncludes(output!, "Options:");
  assertStringIncludes(output!, "--verbose, -v");
  unmount();
});

Deno.test("Help component - options only rendering", () => {
  const options = {
    config: {
      value: "config.json",
      description: "Path to config file",
      alias: "c",
    },
  };

  const { lastFrame, unmount } = render(
    <Help
      name="test-cli"
      description="A test CLI"
      consumedArgs={["test-cli"]}
      commands={[]}
      flags={{}}
      options={options}
      error={undefined}
    />,
  );

  const output = lastFrame();
  assertStringIncludes(output!, "Usage:");
  assertStringIncludes(output!, "test-cli [options]");
  assertStringIncludes(output!, "Options:");
  assertStringIncludes(output!, "--config=<value>, -c=<value>");
  unmount();
});

Deno.test("Help component - commands and flags rendering", () => {
  const mockCommands: Command[] = [{
    name: "init",
    description: "Initialize project",
    commands: [],
    defaultFlags: {},
    defaultOptions: {},
    execute: async () => {},
  }];
  const flags = {
    verbose: {
      value: false,
      description: "Enable verbose logging",
      alias: "v",
    },
  };

  const { lastFrame, unmount } = render(
    <Help
      name="test-cli"
      description="A test CLI"
      consumedArgs={["test-cli"]}
      commands={mockCommands}
      flags={flags}
      options={{}}
      error={undefined}
    />,
  );

  const output = lastFrame();
  assertStringIncludes(output!, "Usage:");
  assertStringIncludes(output!, "test-cli [command] [options]");
  assertStringIncludes(output!, "Commands:");
  assertStringIncludes(output!, "init");
  assertStringIncludes(output!, "Options:");
  assertStringIncludes(output!, "--verbose, -v");
  unmount();
});

Deno.test("Help component - all features rendering", () => {
  const mockCommands: Command[] = [{
    name: "init",
    description: "Initialize project",
    commands: [],
    defaultFlags: {},
    defaultOptions: {},
    execute: async () => {},
  }];
  const flags = {
    verbose: {
      value: false,
      description: "Enable verbose logging",
      alias: "v",
    },
  };
  const options = {
    config: {
      value: "config.json",
      description: "Path to config file",
      alias: "c",
    },
  };

  const { lastFrame, unmount } = render(
    <Help
      name="test-cli"
      description="A test CLI"
      consumedArgs={["test-cli"]}
      commands={mockCommands}
      flags={flags}
      options={options}
      error={undefined}
    />,
  );

  const output = lastFrame();
  assertStringIncludes(output!, "Usage:");
  assertStringIncludes(output!, "test-cli [command] [options]");
  assertStringIncludes(output!, "Commands:");
  assertStringIncludes(output!, "init");
  assertStringIncludes(output!, "Options:");
  assertStringIncludes(output!, "--verbose, -v");
  assertStringIncludes(output!, "--config=<value>, -c=<value>");
  unmount();
});

Deno.test("Help component - flags and options without aliases", () => {
  const flags = {
    verbose: {
      value: false,
      description: "Enable verbose logging",
      alias: undefined,
    },
  };
  const options = {
    config: {
      value: "config.json",
      description: "Path to config file",
      alias: undefined,
    },
  };

  const { lastFrame, unmount } = render(
    <Help
      name="test-cli"
      description="A test CLI"
      consumedArgs={["test-cli"]}
      commands={[]}
      flags={flags}
      options={options}
      error={undefined}
    />,
  );

  const output = lastFrame();
  assertStringIncludes(output!, "Options:");
  assertStringIncludes(output!, "--verbose");
  // Check that the alias portion (", -v") is NOT present
  if (output!.includes("--verbose,")) {
    throw new Error(
      "Alias separator should not be present when alias is undefined",
    );
  }
  assertStringIncludes(output!, "--config=<value>");
  if (output!.includes("--config=<value>,")) {
    throw new Error(
      "Alias separator should not be present when alias is undefined",
    );
  }
  unmount();
});
