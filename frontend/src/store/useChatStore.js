import { create } from "zustand";
import { toast } from "react-hot-toast";
import axiosInstance from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

const sortUsersByLatestMessage = (users) =>
  [...users].sort((a, b) => new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0));

const messagePreview = (message) =>
  message.call ? "Cuộc gọi" : message.text || (message.attachment ? "[Tệp đính kèm]" : "");

const replaceMessage = (messages, updatedMessage) =>
  messages.map((message) => message._id === updatedMessage._id ? updatedMessage : message);

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isNewMessageOpen: false,

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

  updateConversationSetting: async (userId, changes) => {
    const previousUsers = get().users;
    set({
      users: previousUsers.map((user) =>
        user._id === userId ? { ...user, ...changes } : user
      ),
    });
    try {
      const { data } = await axiosInstance.patch(`/messages/conversations/${userId}/settings`, changes);
      set({
        users: get().users.map((user) =>
          user._id === userId ? { ...user, ...data } : user
        ),
      });
      return data;
    } catch (error) {
      set({ users: previousUsers });
      throw error;
    }
  },

  markConversationSeen: async (userId) => {
    const socket = useAuthStore.getState().socket;
    if (socket?.connected) socket.emit("conversationSeen", { peerId: userId });
    else await axiosInstance.patch(`/messages/conversations/${userId}/seen`);
    set({
      users: get().users.map((user) =>
        user._id === userId
          ? { ...user, unreadCount: 0, manuallyUnread: false }
          : user
      ),
    });
  },

  downloadAttachment: async (message) => {
    const response = await axiosInstance.get(`/messages/attachments/${message._id}/download`, {
      responseType: "blob",
    });
    const url = URL.createObjectURL(response.data);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = message.attachment?.name || "download";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
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
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.on("newMessage", (newMessage) => {
      socket.emit("messageDelivered", { messageId: newMessage._id });
      const activeUser = get().selectedUser;
      const isActiveConversation = activeUser?._id === newMessage.senderId;
      set({
        messages: isActiveConversation ? [...get().messages, newMessage] : get().messages,
        users: sortUsersByLatestMessage(get().users.map((user) =>
          user._id === newMessage.senderId
            ? {
                ...user,
                lastMessageAt: newMessage.createdAt,
                lastMessageText: messagePreview(newMessage),
                unreadCount: isActiveConversation ? 0 : (user.unreadCount || 0) + 1,
              }
            : user
        )),
      });
      if (isActiveConversation) get().markConversationSeen(newMessage.senderId);
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.off("newMessage");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser: selectedUser }),
}));
