import type { ConfigScope } from "./config-scope.js";

/** Port: raw YAML text per config scope (no parse policy). Implementations live in apps. */
export interface ConfigFile {
  pathFor(scope: ConfigScope): string;
  load(scope: ConfigScope): Promise<string>;
  save(scope: ConfigScope, data: string): Promise<void>;
  exists(scope: ConfigScope): Promise<boolean>;
}
