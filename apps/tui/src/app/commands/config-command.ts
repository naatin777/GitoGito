import { EOL } from "node:os";
import { Command } from "@cliffy/command";
import { type ConfigScope, formatConfigSetParseError, parseConfigSetArgs } from "@gitogito/core";
import type { AppDeps } from "../make-deps.js";

/** Merged globals from the app root (`--json`, `--dry-run`, etc.). */
type ConfigCommandCliOptions = {
  json?: boolean;
  dryRun?: boolean;
  verbose?: boolean;
};

function configCliOptionsFromActionOptions(value: unknown): ConfigCommandCliOptions {
  if (value === null || typeof value !== "object") {
    return {};
  }
  return value as ConfigCommandCliOptions;
}

interface SetConfigResult {
  scope: "global" | "project" | "local";
  path: string;
  key: string;
  value: string;
  dryRun: boolean;
}

function fail(message: string, json: boolean): never {
  if (json) {
    process.stdout.write(`${JSON.stringify({ ok: false, error: message })}${EOL}`);
  } else {
    process.stderr.write(`${message}${EOL}`);
  }
  process.exit(1);
}

function printResult(r: SetConfigResult, json: boolean) {
  if (json) {
    process.stdout.write(`${JSON.stringify({ ok: true, ...r })}${EOL}`);
  } else if (r.dryRun) {
    process.stdout.write(`[dry-run] would set ${r.key}=${JSON.stringify(r.value)} in ${r.path}${EOL}`);
  } else {
    process.stdout.write(`set ${r.key}=${JSON.stringify(r.value)} (${r.scope} → ${r.path})${EOL}`);
  }
}

const SCOPE_CONFIG = [
  {
    name: "project" as const,
    description: "Project config: `.gitogito.yaml` in cwd.",
  },
  {
    name: "local" as const,
    description: "Local overrides: `.gitogito.local.yaml` in cwd.",
  },
  {
    name: "global" as const,
    description: "User config under XDG config home.",
  },
] as const;

export function createConfigCommand(deps: AppDeps) {
  const { configService } = deps;
  const config = new Command().description("Manage configuration").action(function () {
    this.showHelp();
  });

  for (const { name, description } of SCOPE_CONFIG) {
    const scope: ConfigScope = name;
    config.command(
      name,
      new Command()
        .description(description)
        .action(function () {
          this.showHelp();
        })
        .command(
          "set",
          new Command()
            .description("Set a configuration value in YAML for this scope")
            .arguments("<key:string> <value:string>")
            .action(async (opt: unknown, key: string, value: string) => {
              const flags = configCliOptionsFromActionOptions(opt);
              const args = parseConfigSetArgs({ key, value });
              if (!args.success) {
                fail(formatConfigSetParseError(args.error), Boolean(flags.json));
              }
              const { key: keyTrimmed, value: valueParsed } = args.data;
              const dryRun = Boolean(flags.dryRun);
              const writeResult = await configService.setScalar(scope, keyTrimmed, valueParsed, { dryRun });
              if (writeResult.isErr()) {
                const e = writeResult.error;
                const msg = e.code === "invalid_yaml" ? `Invalid YAML: ${e.message}` : `${e.code}: ${e.message}`;
                fail(msg, Boolean(flags.json));
              }
              const { path, scope: outScope } = writeResult.value;
              printResult(
                {
                  scope: outScope,
                  path,
                  key: keyTrimmed,
                  value: valueParsed,
                  dryRun,
                },
                Boolean(flags.json),
              );
            }),
        ),
    );
  }
  return config;
}
