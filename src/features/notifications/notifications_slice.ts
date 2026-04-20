import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type NotificationLevel = "info" | "success" | "warn" | "error";

export interface Notification {
  id: string;
  level: NotificationLevel;
  message: string;
}

interface NotificationsState {
  items: Notification[];
}

const initialState: NotificationsState = {
  items: [],
};

let nextId = 1;

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    addNotification: (
      state,
      action: PayloadAction<Omit<Notification, "id">>,
    ) => {
      state.items.push({ id: String(nextId++), ...action.payload });
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((n) => n.id !== action.payload);
    },
    clearNotifications: (state) => {
      state.items = [];
    },
  },
});

export const { addNotification, removeNotification, clearNotifications } =
  notificationsSlice.actions;
export const notificationsReducer = notificationsSlice.reducer;
