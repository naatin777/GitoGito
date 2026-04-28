import type { RuntimeEnv } from "../src/entities/config/runtime_env.js";

/** Test double for controlled cwd / home / XDG; not a production code path. */
export class MemoryRuntimeEnv implements RuntimeEnv {
  constructor(
    private readonly cwd: string,
    private readonly home: string,
    private readonly xdg: string | undefined,
  ) {}

  getCwd(): string {
    return this.cwd;
  }

  getHome(): string {
    return this.home;
  }

  getXdgConfigHome(): string | undefined {
    return this.xdg;
  }
}
