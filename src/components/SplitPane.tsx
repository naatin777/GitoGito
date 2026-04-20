import { useTerminalDimensions } from "@opentui/react";
import { useEffect, useRef, useState } from "react";
import { useMousePointer } from "../hooks/use_mouse_pointer.ts";
import { Box, Text } from "./ThemedComponents.tsx";

export type SplitPaneDirection = "horizontal" | "vertical";

export type SplitPaneProps = {
  direction?: SplitPaneDirection;
  defaultSize?: number | string;
  /** Minimum size of either pane in columns/rows (default: 5) */
  minSize?: number;
  /** Maximum size of the first pane in columns/rows */
  maxSize?: number;
  children: [React.ReactNode, React.ReactNode];
};

export function parseDefaultSize(
  defaultSize: number | string,
  containerSize: number,
): number {
  if (typeof defaultSize === "number") {
    return defaultSize;
  }
  if (typeof defaultSize === "string" && defaultSize.endsWith("%")) {
    const pct = parseFloat(defaultSize) / 100;
    return Math.round(containerSize * pct);
  }
  return Math.floor(containerSize / 2);
}

const POINTER_HOVER_DELAY_MS = 0;

function clampDividerPosition(
  position: number,
  containerSize: number,
  minSize = 5,
  maxSize?: number,
): number {
  const lastValidPosition = Math.max(containerSize - 1, 0);
  const minPosition = Math.min(minSize, lastValidPosition);
  const maxPositionFromMinSize = Math.max(lastValidPosition - minSize, 0);
  let maxPosition = Math.min(
    maxSize ?? maxPositionFromMinSize,
    lastValidPosition,
  );

  if (maxPosition < minPosition) {
    maxPosition = lastValidPosition;
  }

  return Math.min(Math.max(position, minPosition), maxPosition);
}

/* v8 ignore start */
export function SplitPane({
  direction = "horizontal",
  defaultSize = "50%",
  minSize,
  maxSize,
  children,
}: SplitPaneProps) {
  const { width, height } = useTerminalDimensions();
  const setPointer = useMousePointer();
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dividerPosition, setDividerPosition] = useState(30);

  const isHorizontal = direction === "horizontal";
  const containerSize = isHorizontal ? width : height;
  const dividerLength = Math.max(isHorizontal ? height : width, 1);
  const clampedDividerPosition = clampDividerPosition(
    dividerPosition,
    containerSize,
    minSize,
    maxSize,
  );
  const resizePointer = isHorizontal ? "ew-resize" : "ns-resize";

  const clearHoverTimer = () => {
    if (hoverTimerRef.current !== null) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      clearHoverTimer();
      setPointer("default");
    };
  }, [setPointer]);

  return (
    <Box
      width="100%"
      height="100%"
      flexDirection={isHorizontal ? "row" : "column"}
      onMouseDrag={(event) => {
        if (!isDragging) {
          return;
        }

        setDividerPosition(clampDividerPosition(
          isHorizontal ? event.x : event.y,
          containerSize,
          minSize,
          maxSize,
        ));
      }}
      onMouseUp={() => {
        clearHoverTimer();
        setIsDragging(false);
        setPointer("default");
      }}
    >
      <Box
        width={isHorizontal ? clampedDividerPosition : "100%"}
        height={isHorizontal ? "100%" : clampedDividerPosition}
      >
        {children[0]}
      </Box>
      <Box
        width={isHorizontal ? 1 : "100%"}
        height={isHorizontal ? "100%" : 1}
        flexDirection={isHorizontal ? "column" : "row"}
        onMouseOver={() => {
          if (isDragging) {
            return;
          }

          clearHoverTimer();
          hoverTimerRef.current = setTimeout(() => {
            setPointer(resizePointer);
            hoverTimerRef.current = null;
          }, POINTER_HOVER_DELAY_MS);
        }}
        onMouseOut={() => {
          clearHoverTimer();

          if (!isDragging) {
            setPointer("default");
          }
        }}
        onMouseDown={() => {
          clearHoverTimer();
          setIsDragging(true);
          setPointer(resizePointer);
        }}
        onMouseUp={() => {
          clearHoverTimer();
          setIsDragging(false);
          setPointer("default");
        }}

      >
        {isHorizontal
          ? Array.from({ length: dividerLength }, (_, index) => (
            <Text key={index} color="primary">
              ┃
            </Text>
          ))
          : (
            <Text color="primary">
              {"━".repeat(dividerLength)}
            </Text>
          )}
      </Box>
      <Box
        flexGrow={1}
        width={isHorizontal ? "auto" : "100%"}
        height={isHorizontal ? "100%" : "auto"}
      >
        {children[1]}
      </Box>
    </Box>
  );
}
/* v8 ignore end */
