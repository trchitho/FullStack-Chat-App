import { create } from "zustand";
import axiosInstance from "../lib/axios";

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  isLoading: false,

  getNotifications: async () => {
    set({ isLoading: true });
    try {
      const { data } = await axiosInstance.get("/notifications");
      set({ notifications: data });
    } finally {
      set({ isLoading: false });
    }
  },

  markAllRead: async () => {
    await axiosInstance.patch("/notifications/read");
    set({ notifications: get().notifications.map((item) => ({ ...item, readAt: item.readAt || new Date().toISOString() })) });
  },

  addNotification: (notification) => {
    set({ notifications: [notification, ...get().notifications.filter((item) => item._id !== notification._id)] });
  },

  markSenderRead: async (senderId) => {
    await axiosInstance.patch(`/notifications/read/${senderId}`);
    set({
      notifications: get().notifications.map((item) =>
        String(item.senderId?._id || item.senderId) === senderId
          ? { ...item, readAt: item.readAt || new Date().toISOString() }
          : item
      ),
    });
  },
}));
