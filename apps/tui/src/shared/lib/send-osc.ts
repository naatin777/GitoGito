import type { CliRenderer } from "@opentui/core";

type OscRendererInternal = {
  rendererPtr: unknown;
  lib: {
    writeOut: (ptr: unknown, data: Uint8Array) => void;
  };
};

export function sendOsc(renderer: CliRenderer, sequence: string) {
  const data = new TextEncoder().encode(`\x1b]${sequence}\x07`);
  (renderer as unknown as OscRendererInternal).lib.writeOut(renderer.rendererPtr, data);
}
