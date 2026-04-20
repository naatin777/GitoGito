import { closeSync, openSync, writeSync } from "node:fs";
import { useCallback, useRef } from "react";


export type MousePointerStyle =
  | "default"       // The platform-dependent default cursor
  | "pointer"       // A pointing hand, typically used for links
  | "text"          // An I-beam cursor for text selection
  | "crosshair"     // A thin crosshair cursor
  | "move"          // An arrow cursor indicating something can be moved
  | "not-allowed"   // Indicates that an action is prohibited
  | "wait"          // An hourglass or spinning wheel indicating the UI is busy
  | "progress"      // An arrow with a small wait indicator showing background activity
  | "help"          // An arrow with a question mark indicating help is available
  | "grab"          // An open hand, indicating something can be gripped
  | "grabbing"      // A closed hand, indicating something is being dragged
  | "zoom-in"       // A magnifying glass with a plus sign
  | "zoom-out"      // A magnifying glass with a minus sign
  | "e-resize"      // Indicates an edge is to be moved east (right)
  | "w-resize"      // Indicates an edge is to be moved west (left)
  | "s-resize"      // Indicates an edge is to be moved south (down)
  | "n-resize"      // Indicates an edge is to be moved north (up)
  | "ne-resize"     // Indicates an edge is to be moved north-east (up-right)
  | "nw-resize"     // Indicates an edge is to be moved north-west (up-left)
  | "se-resize"     // Indicates an edge is to be moved south-east (down-right)
  | "sw-resize"     // Indicates an edge is to be moved south-west (down-left)
  | "ew-resize"     // A bidirectional cursor for horizontal resizing
  | "ns-resize"     // A bidirectional cursor for vertical resizing
  | "nesw-resize"   // A bidirectional cursor for diagonal resizing (top-right to bottom-left)
  | "nwse-resize"   // A bidirectional cursor for diagonal resizing (top-left to bottom-right)
  | "col-resize"    // Indicates a column can be resized horizontally
  | "row-resize"    // Indicates a row can be resized vertically
  | "all-scroll"    // Indicates that the view can be scrolled in any direction
  | "vertical-text" // An I-beam cursor for vertical text selection
  | "copy"          // An arrow with a plus sign indicating a copy will be made
  | "alias"         // An arrow indicating a shortcut or alias will be created
  | "no-drop";      // Indicates that an item cannot be dropped at the current location


type MousePointerWriter = (output: string) => void;

let ttyFd: number | null = null;
let mousePointerWriter: MousePointerWriter | null = null;

function createMousePointerWriter(): MousePointerWriter {
  if (mousePointerWriter) {
    return mousePointerWriter;
  }

  try {
    ttyFd = openSync("/dev/tty", "w");
  } catch {
    // In CI/sandbox environments, /dev/tty may be unavailable.
    // Fall back to a no-op writer so pointer updates do not crash rendering/tests.
    mousePointerWriter = () => { };
    return mousePointerWriter;
  }

  mousePointerWriter = (output: string) => {
    if (ttyFd === null) {
      throw new Error("Mouse pointer writer is not initialized.");
    }

    writeSync(ttyFd, output);
  };

  return mousePointerWriter;
}

export function setMousePointerWriterForTest(writer: MousePointerWriter | null) {
  if (ttyFd !== null) {
    closeSync(ttyFd);
    ttyFd = null;
  }

  mousePointerWriter = writer;
}

export function useMousePointer() {
  const lastStyleRef = useRef<MousePointerStyle | null>(null);

  return useCallback((style: MousePointerStyle) => {
    if (lastStyleRef.current === style) {
      return;
    }

    createMousePointerWriter()(`\x1b]22;${style}\x1b\\`);
    lastStyleRef.current = style;
  }, []);
}
