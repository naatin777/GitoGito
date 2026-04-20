import { useAppDispatch } from "../../app/hooks.ts";
import {
  addNotification,
  type NotificationLevel,
} from "./notifications_slice.ts";

export function useNotify() {
  const dispatch = useAppDispatch();

  const notify = (level: NotificationLevel, message: string) => {
    dispatch(addNotification({ level, message }));
  };

  return {
    info: (message: string) => notify("info", message),
    success: (message: string) => notify("success", message),
    warn: (message: string) => notify("warn", message),
    error: (message: string) => notify("error", message),
  };
}
