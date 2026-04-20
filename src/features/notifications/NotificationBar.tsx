import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks.ts";
import { Box } from "../../components/ThemedComponents.tsx";
import { useThemeColors } from "../config/use_theme_colors.ts";
import {
  removeNotification,
  type NotificationLevel,
} from "./notifications_slice.ts";

const AUTO_DISMISS_MS = 4000;

const ICONS: Record<NotificationLevel, string> = {
  info: "ℹ",
  success: "✓",
  warn: "⚠",
  error: "✗",
};

export const NotificationBar = () => {
  const theme = useThemeColors();
  const dispatch = useAppDispatch();
  const items = useAppSelector((s) => s.notifications.items);

  const latest = items[items.length - 1] ?? null;

  useEffect(() => {
    if (!latest) return;
    const timer = setTimeout(() => {
      dispatch(removeNotification(latest.id));
    }, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [latest?.id, dispatch]);

  if (!latest) return null;

  const colorFor = (level: NotificationLevel): string => {
    switch (level) {
      case "info": return theme.info;
      case "success": return theme.success;
      case "warn": return theme.warning;
      case "error": return theme.error;
    }
  };

  const fg = colorFor(latest.level);

  return (
    <Box width="100%" height={10} flexDirection="row">
      <text fg={fg}>{`${ICONS[latest.level]} ${latest.message}`} aaaaaaaa</text>
    </Box>
  );
};
