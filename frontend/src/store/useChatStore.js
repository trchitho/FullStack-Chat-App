import { create } from "zustand";
import { toast } from "react-hot-toast";
import axiosInstance from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import { useNotificationStore } from "./useNotificationStore";

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
      const [usersResponse, groupsResponse] = await Promise.all([
        axiosInstance.get("/messages/users"),
        axiosInstance.get("/conversations"),
      ]);
      set({
        users: sortUsersByLatestMessage([
          ...usersResponse.data,
          ...groupsResponse.data,
        ]),
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Không tải được cuộc trò chuyện");
    }
    set({ isUsersLoading: false });
  },

  getMessages: async (conversationId) => {
    set({ isMessagesLoading: true });
    try {
      const selectedUser = get().selectedUser;
      const endpoint = selectedUser?.isGroup
        ? `/conversations/${conversationId}/messages`
        : `/messages/${conversationId}`;
      const res = await axiosInstance.get(endpoint);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Không tải được tin nhắn");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const endpoint = selectedUser.isGroup
        ? `/conversations/${selectedUser._id}/messages`
        : `/messages/send/${selectedUser._id}`;
      const res = await axiosInstance.post(endpoint, messageData);
      set({
        messages: [...messages, res.data],
        users: sortUsersByLatestMessage(get().users.map((user) =>
          user._id === selectedUser._id
            ? { ...user, lastMessageAt: res.data.createdAt, lastMessageText: messagePreview(res.data) }
            : user
        )),
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Không gửi được tin nhắn");
    }
  },

  createGroupConversation: async (participantIds) => {
    const { data } = await axiosInstance.post("/conversations", { participantIds });
    set({ users: sortUsersByLatestMessage([data, ...get().users]) });
    return data;
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

  sendMessageTo: async (userId, messageData) => {
    const { data } = await axiosInstance.post(`/messages/send/${userId}`, messageData);
    set({
      users: sortUsersByLatestMessage(get().users.map((user) =>
        user._id === userId
          ? { ...user, lastMessageAt: data.createdAt, lastMessageText: messagePreview(data) }
          : user
      )),
    });
    return data;
  },

  markConversationSeen: async (userId) => {
    const selectedUser = get().selectedUser;
    if (selectedUser?.isGroup) {
      await axiosInstance.patch(`/conversations/${userId}/seen`);
      set({
        users: get().users.map((user) =>
          user._id === userId ? { ...user, unreadCount: 0 } : user
        ),
      });
      return;
    }
    const socket = useAuthStore.getState().socket;
    if (socket?.connected) socket.emit("conversationSeen", { peerId: userId });
    else await axiosInstance.patch(`/messages/conversations/${userId}/seen`);
    useNotificationStore.getState().markSenderRead(userId).catch(() => {});
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

  subscribeToMessages: (activeSocket) => {
    const socket = activeSocket || useAuthStore.getState().socket;
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
    socket.on("newGroupMessage", ({ conversationId, message }) => {
      const activeConversation = get().selectedUser;
      const isActive = activeConversation?.isGroup && activeConversation._id === conversationId;
      set({
        messages: isActive ? [...get().messages, message] : get().messages,
        users: sortUsersByLatestMessage(get().users.map((conversation) =>
          conversation._id === conversationId
            ? {
                ...conversation,
                lastMessageAt: message.createdAt,
                lastMessageText: messagePreview(message),
                unreadCount: isActive ? 0 : (conversation.unreadCount || 0) + 1,
              }
            : conversation
        )),
      });
      socket.emit("messageDelivered", { messageId: message._id });
    });
    socket.on("messageDeliveredUpdate", (updatedMessage) => {
      set({ messages: replaceMessage(get().messages, updatedMessage) });
    });
    socket.on("conversationSeenUpdate", ({ userId, seenAt }) => {
      set({
        messages: get().messages.map((message) =>
          message.receiverId === userId && message.senderId === useAuthStore.getState().authUser?._id
            ? { ...message, seenBy: [{ user: userId, at: seenAt }] }
            : message
        ),
      });
    });
    socket.on("groupSeenUpdate", ({ conversationId, userId, seenAt }) => {
      if (get().selectedUser?._id !== conversationId) return;
      set({
        messages: get().messages.map((message) => {
          const alreadySeen = message.seenBy?.some((receipt) => String(receipt.user?._id || receipt.user) === userId);
          return alreadySeen ? message : { ...message, seenBy: [...(message.seenBy || []), { user: userId, at: seenAt }] };
        }),
      });
    });
  },

  unsubscribeFromMessages: (activeSocket) => {
    const socket = activeSocket || useAuthStore.getState().socket;
    if (!socket) return;

    socket.off("newMessage");
    socket.off("newGroupMessage");
    socket.off("messageDeliveredUpdate");
    socket.off("conversationSeenUpdate");
    socket.off("groupSeenUpdate");
  },

  setSelectedUser: (selectedUser) => {
    set({ selectedUser, isNewMessageOpen: false });
    if (selectedUser) get().markConversationSeen(selectedUser._id);
  },
  openNewMessage: () => set({ isNewMessageOpen: true }),
  closeNewMessage: () => set({ isNewMessageOpen: false }),
}));
