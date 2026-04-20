import { ScrollBoxRenderable, TextAttributes } from "@opentui/core";
import { useEffect, useRef, useState } from "react";
import { useThemeColors } from "../features/config/use_theme_colors.ts";
import { Box, ScrollBox, Text } from "./ThemedComponents.tsx";

type LogLevel = "log" | "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
}

export interface ConsolePanelProps {
  /** 表示する最大行数（デフォルト: 5） */
  maxLines?: number;
  height?: number | `${number}%` | "auto";
  width?: number | `${number}%` | "auto";
}

export const ConsolePanel = ({
  maxLines = 5,
  height = 7,
  width = "100%",
}: ConsolePanelProps) => {
  const theme = useThemeColors();
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const scrollboxRef = useRef<ScrollBoxRenderable | null>(null);
  const originals = useRef<Record<LogLevel, (...args: unknown[]) => void>>({
    log: console.log,
    info: console.info,
    warn: console.warn,
    error: console.error,
  });

  useEffect(() => {
    const levels: LogLevel[] = ["log", "info", "warn", "error"];

    for (const level of levels) {
      originals.current[level] = console[level].bind(console);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (console as any)[level] = (...args: unknown[]) => {
        const message = args
          .map((a) => (typeof a === "string" ? a : JSON.stringify(a)))
          .join(" ");
        // Defer to avoid calling setState during React reconciliation
        setTimeout(() => {
          setEntries((prev) => [...prev, { level, message }]);
        }, 0);
      };
    }

    return () => {
      for (const level of levels) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (console as any)[level] = originals.current[level];
      }
    };
  }, []);

  const colorFor = (level: LogLevel): string => {
    switch (level) {
      case "warn":
        return theme.warning;
      case "error":
        return theme.error;
      default:
        return theme.text;
    }
  };

  const visible = entries.slice(-maxLines);

  useEffect(() => {
    scrollboxRef.current?.scrollTo(visible.length);
  }, [visible.length]);

  return (
    <Box
      height={height}
      width={width}
      flexDirection="column"
      border
      borderStyle="rounded"
      borderColor={theme.border}
    >
      <Text attributes={TextAttributes.DIM}>console</Text>
      <ScrollBox ref={scrollboxRef} scrollY flexGrow={1}>
        {visible.map((entry, i) => (
          <text key={i} fg={colorFor(entry.level)}>
            {`[${entry.level}] ${entry.message}`}
          </text>
        ))}
      </ScrollBox>
    </Box>
  );
};
