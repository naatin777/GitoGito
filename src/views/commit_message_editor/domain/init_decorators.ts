/**
 * Initialize commit decorators
 * This should be called once at application startup to register built-in decorators
 */

import { decoratorRegistry } from "./commit_decorator.ts";
import { registerBuiltinDecorators } from "./builtin_decorators.ts";

/**
 * Flag to track if decorators have been initialized
 */
let initialized = false;

/**
 * Initialize all built-in decorators
 * Safe to call multiple times - will only initialize once
 */
export function initializeDecorators(): void {
  if (initialized) {
    return;
  }

  // Register all built-in decorators
  registerBuiltinDecorators(decoratorRegistry);

  initialized = true;
}

/**
 * Reset initialization state (useful for testing)
 */
export function resetDecorators(): void {
  decoratorRegistry.clear();
  initialized = false;
}
