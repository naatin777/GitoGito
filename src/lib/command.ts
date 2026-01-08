import { parseArgs } from "@std/cli";
import React from "react";
import { Help } from "../features/help/ui.tsx";
import { runTui } from "./tui.ts";

export type FlagType = Record<string, {
  value: boolean;
  description: string;
  alias: string | undefined;
}>;

export type OptionType = Record<string, {
  value: string;
  description: string;
  alias: string | undefined;
}>;

export interface Command {
  name: string;
  description: string;
  commands: Command[];
  defaultFlags: FlagType;
  defaultOptions: OptionType;
  execute(
    remainingArgs: string[],
    consumedArgs: string[],
    flags: FlagType,
    options: OptionType,
  ): Promise<void>;
}

export abstract class BaseCommand<
  F extends FlagType,
  O extends OptionType,
> implements Command {
  abstract name: string;
  abstract description: string;
  abstract commands: Command[];
  abstract defaultFlags: F;
  abstract defaultOptions: O;

  abstract execute(
    remainingArgs: string[],
    consumedArgs: string[],
    flags: F,
    options: O,
  ): Promise<void>;

  async executeSubCommand(
    parsed: {
      [x: string]: unknown;
      _: Array<string | number>;
    },
    consumedArgs: string[],
    flags: F,
    options: O,
  ): Promise<void> {
    const remainingArgs = parsed._.map((arg) => arg.toString());
    const appliedFlags = this.applyParsedFlags(flags, parsed);
    const appliedOptions = this.applyParsedOptions(options, parsed);

    const command = this.commands.find((command) =>
      command.name === remainingArgs[0]
    );

    if (command) {
      await command.execute(
        remainingArgs.slice(1),
        [...consumedArgs, command.name],
        appliedFlags,
        appliedOptions,
      );
    } else {
      await this.help(
        consumedArgs,
        `Command "${remainingArgs[0]}" not found.`,
      );
    }
  }

  applyParsedFlags(
    flags: F,
    parsed: {
      [x: string]: unknown;
      _: Array<string | number>;
    },
  ): F {
    return Object.fromEntries(
      Object.entries(flags).map(([key, flagDef]) => [
        key,
        {
          ...flagDef,
          value: parsed[key] !== undefined ? parsed[key] : flagDef.value,
        },
      ]),
    ) as F;
  }

  applyParsedOptions(
    options: O,
    parsed: {
      [x: string]: unknown;
      _: Array<string | number>;
    },
  ): O {
    return Object.fromEntries(
      Object.entries(options).map(([key, optionDef]) => [
        key,
        {
          ...optionDef,
          value: parsed[key] !== undefined ? parsed[key] : optionDef.value,
        },
      ]),
    ) as O;
  }

  parseArgs(remainingArgs: string[], flags: F, options: O) {
    type FlagKeys = keyof F & string;
    type OptionKeys = keyof O & string;
    const flagKeys = Object.keys(this.defaultFlags ?? {}) as FlagKeys[];
    const optionKeys = Object.keys(this.defaultOptions ?? {}) as OptionKeys[];
    const alias = Object.fromEntries([
      ...flagKeys.flatMap((key) => {
        const alias = this.defaultFlags[key].alias;
        return alias ? [[alias, key]] : [];
      }),
      ...optionKeys.flatMap((key) => {
        const alias = this.defaultOptions[key].alias;
        return alias ? [[alias, key]] : [];
      }),
    ]);
    const defaults = {
      ...Object.fromEntries(
        flagKeys.map((
          key,
        ) => [key, flags[key]?.value ?? this.defaultFlags[key].value]),
      ),
      ...Object.fromEntries(
        optionKeys.map((
          key,
        ) => [key, options[key]?.value ?? this.defaultOptions[key].value]),
      ),
    };
    type ParsedArgs =
      & { [K in keyof F]: F[K]["value"] }
      & { [K in keyof O]: O[K]["value"] }
      & {
        _: (string | number)[];
        [x: string]: unknown;
      };

    return parseArgs(remainingArgs, {
      boolean: flagKeys,
      string: optionKeys,
      alias: alias,
      // deno-lint-ignore no-explicit-any
      default: defaults as any,
      stopEarly: true,
    }) as ParsedArgs;
  }

  async help(
    consumedArgs: string[],
    error: string | undefined = undefined,
  ): Promise<void> {
    const help = React.createElement(Help, {
      name: this.name,
      description: this.description,
      consumedArgs,
      flags: this.defaultFlags,
      options: this.defaultOptions,
      commands: this.commands,
      error,
    });

    await runTui(help, false);
  }
}
