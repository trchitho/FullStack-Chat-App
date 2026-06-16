import { create } from "zustand";
import axiosInstance from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

const isOwnNotification = (notification) => {
  const authUserId = useAuthStore.getState().authUser?._id;
  const senderId = notification?.senderId?._id || notification?.senderId;
  return authUserId && senderId && String(authUserId) === String(senderId);
};

const removeOwnNotifications = (notifications) =>
  notifications.filter((notification) => !isOwnNotification(notification));

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  isLoading: false,

  getNotifications: async () => {
    set({ isLoading: true });
    try {
      const { data } = await axiosInstance.get("/notifications");
      set({ notifications: removeOwnNotifications(data) });
    } finally {
      set({ isLoading: false });
    }
  },

  markAllRead: async () => {
    await axiosInstance.patch("/notifications/read");
    set({ notifications: get().notifications.map((item) => ({ ...item, readAt: item.readAt || new Date().toISOString() })) });
  },

  addNotification: (notification) => {
    if (isOwnNotification(notification)) return;
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
