import { create } from "zustand";
import axiosInstance from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

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
}));
