import type { KeyEvent } from "@opentui/core";

export function keyEventToInput(event: KeyEvent): string {
  if (event.name === "space") return " ";
  if (event.name.length === 1) return event.name;
  if (event.sequence.length === 1 && !event.ctrl && !event.meta) {
    return event.sequence;
  }
  return "";
}

export function isCtrlC(event: KeyEvent): boolean {
  return event.ctrl && keyEventToInput(event) === "c";
}

export function isEnter(event: KeyEvent): boolean {
  return event.name === "return" || event.name === "enter";
}
