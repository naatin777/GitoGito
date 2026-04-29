import { join } from "node:path";
import type { ConfigScope, RuntimeEnv } from "@gitogito/core";

/** Resolves concrete filesystem paths per scope (reference: cwd-based project/local, XDG global). */
export interface ConfigPathResolver {
  pathFor(scope: ConfigScope): string;
}

export class GitogitoConfigPathResolver implements ConfigPathResolver {
  constructor(
    private readonly env: RuntimeEnv,
    private readonly appSlug: string,
  ) {}

  pathFor(scope: ConfigScope): string {
    const xdg = this.env.getXdgConfigHome() ?? join(this.env.getHome(), ".config");
    const cwd = this.env.getCwd();
    switch (scope) {
      case "global":
        return join(xdg, this.appSlug, "config.yaml");
      case "project":
        return join(cwd, `.${this.appSlug}.yaml`);
      case "local":
        return join(cwd, `.${this.appSlug}.local.yaml`);
    }
  }
}
