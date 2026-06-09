import { create } from "zustand";
import { toast } from "react-hot-toast";
import axiosInstance from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

const sortUsersByLatestMessage = (users) =>
  [...users].sort((a, b) => new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0));

const messagePreview = (message) =>
  message.call ? "Cuộc gọi" : message.text || (message.attachment ? "[Tệp đính kèm]" : "");

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    }
    set({ isUsersLoading: false });
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData
      );
      set({
        messages: [...messages, res.data],
        users: sortUsersByLatestMessage(get().users.map((user) =>
          user._id === selectedUser._id
            ? { ...user, lastMessageAt: res.data.createdAt, lastMessageText: messagePreview(res.data) }
            : user
        )),
      });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  uploadAttachment: async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await axiosInstance.post("/messages/attachments", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.attachment;
  },

  sendCallEvent: async (userId, call) => {
    const res = await axiosInstance.post(`/messages/send/${userId}`, { call });
    const { selectedUser } = get();
    set({
      messages: selectedUser?._id === userId ? [...get().messages, res.data] : get().messages,
      users: sortUsersByLatestMessage(get().users.map((user) =>
        user._id === userId ? { ...user, lastMessageAt: res.data.createdAt, lastMessageText: messagePreview(res.data) } : user
      )),
    });
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser =
        newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;

      set({
        messages: [...get().messages, newMessage],
        users: sortUsersByLatestMessage(get().users.map((user) =>
          user._id === newMessage.senderId
            ? { ...user, lastMessageAt: newMessage.createdAt, lastMessageText: newMessage.text || "[Tệp đính kèm]" }
            : user
        )),
      });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.off("newMessage");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser: selectedUser }),
}));
