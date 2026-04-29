/**
 * Port: read-only view of the host process environment needed for path resolution.
 * Concrete process adapters live in apps. In-memory fakes: `../testing/memory-runtime-env.ts`.
 */
export interface RuntimeEnv {
  getCwd(): string;
  getHome(): string;
  getXdgConfigHome(): string | undefined;
}
