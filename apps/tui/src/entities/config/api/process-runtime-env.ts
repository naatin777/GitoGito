import type { RuntimeEnv } from "@gitogito/core";

/** Production adapter: cwd and env vars from the current process. */
export class ProcessRuntimeEnv implements RuntimeEnv {
  getCwd(): string {
    return process.cwd();
  }

  getHome(): string {
    const home = process.env.HOME ?? process.env.USERPROFILE;
    if (!home) {
      throw new Error("HOME or USERPROFILE must be set to resolve global config path.");
    }
    return home;
  }

  getXdgConfigHome(): string | undefined {
    return process.env.XDG_CONFIG_HOME;
  }
}
