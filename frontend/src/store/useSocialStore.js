import { create } from "zustand";
import toast from "react-hot-toast";
import axiosInstance from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useSocialStore = create((set, get) => ({
  profile: null,
  relationship: { status: "none" },
  friends: [],
  profileFriends: [],
  friendRequests: { incoming: [], outgoing: [] },
  posts: [],
  messageRequests: [],
  isLoading: false,

  getProfile: async (userId = "me") => {
    set({ isLoading: true });
    try {
      const { data } = await axiosInstance.get(`/profiles/${userId}`);
      set({ profile: data });
      return data;
    } finally {
      set({ isLoading: false });
    }
  },

  updateProfile: async (changes) => {
    const { data } = await axiosInstance.patch("/profiles/me/details", changes);
    set({ profile: { ...get().profile, ...data } });
    return data;
  },

  updateProfileMedia: async (field, image) => {
    const { data } = await axiosInstance.patch(`/profiles/me/media/${field}`, { image });
    set({ profile: { ...get().profile, ...data } });
    return data;
  },

  getFriends: async () => {
    const { data } = await axiosInstance.get("/friends");
    set({ friends: data });
    return data;
  },

  getProfileFriends: async (userId = "me") => {
    const { data } = await axiosInstance.get(`/friends/user/${userId}`);
    set({ profileFriends: data });
    return data;
  },

  getFriendRequests: async () => {
    const { data } = await axiosInstance.get("/friends/requests");
    set({ friendRequests: data });
    return data;
  },

  getRelationship: async (userId) => {
    const { data } = await axiosInstance.get(`/friends/relationship/${userId}`);
    set({ relationship: data });
    return data;
  },

  sendFriendRequest: async (userId) => {
    const { data } = await axiosInstance.post(`/friends/request/${userId}`);
    set({ relationship: { ...data, direction: "outgoing" } });
  },

  respondToFriendRequest: async (requestId, action) => {
    const { data } = await axiosInstance.patch(`/friends/requests/${requestId}`, { action });
    if (get().relationship?._id === requestId) {
      set({ relationship: action === "accept" ? data : { status: "none" } });
    }
    await Promise.all([get().getFriendRequests(), get().getFriends()]);
  },

  removeFriendship: async (userId) => {
    await axiosInstance.delete(`/friends/${userId}`);
    set({
      relationship: { status: "none" },
      friends: get().friends.filter((friend) => friend._id !== userId),
    });
  },

  getTimeline: async () => {
    set({ isLoading: true });
    try {
      const { data } = await axiosInstance.get("/posts/timeline");
      set({ posts: data });
      return data;
    } finally {
      set({ isLoading: false });
    }
  },

  getUserPosts: async (userId) => {
    const { data } = await axiosInstance.get(`/posts/user/${userId}`);
    set({ posts: data });
    return data;
  },

  createPost: async (payload) => {
    const { data } = await axiosInstance.post("/posts", payload);
    set({ posts: [data, ...get().posts.filter((post) => post._id !== data._id)] });
    toast.success("Đã đăng bài viết");
    return data;
  },

  reactToPost: async (postId, type) => {
    const { data } = await axiosInstance.patch(`/posts/${postId}/reaction`, { type });
    set({
      posts: get().posts.map((post) =>
        post._id === postId ? { ...post, reactions: data } : post
      ),
    });
  },

  getPostReactions: async (postId) => {
    const { data } = await axiosInstance.get(`/posts/${postId}/reactions`);
    return data;
  },

  addComment: async (postId, content) => {
    const { data } = await axiosInstance.post(`/posts/${postId}/comments`, { content });
    set({
      posts: get().posts.map((post) =>
        post._id === postId ? { ...post, comments: [...post.comments, data] } : post
      ),
    });
  },

  addReply: async (postId, commentId, content) => {
    const { data } = await axiosInstance.post(`/posts/${postId}/comments/${commentId}/replies`, { content });
    set({
      posts: get().posts.map((post) => post._id !== postId ? post : {
        ...post,
        comments: post.comments.map((comment) =>
          comment._id === commentId ? { ...comment, replies: [...comment.replies, data] } : comment
        ),
      }),
    });
  },

  reactToComment: async (postId, commentId, type) => {
    const { data } = await axiosInstance.patch(
      `/posts/${postId}/comments/${commentId}/reaction`,
      { type }
    );
    set({
      posts: get().posts.map((post) => post._id !== postId ? post : {
        ...post,
        comments: post.comments.map((comment) =>
          comment._id === commentId ? { ...comment, reactions: data } : comment
        ),
      }),
    });
  },

  subscribeToTimeline: (activeSocket) => {
    const socket = activeSocket || useAuthStore.getState().socket;
    if (!socket) return;
    socket.off("post:new");
    socket.on("post:new", (post) => {
      set({
        posts: [post, ...get().posts.filter((item) => item._id !== post._id)],
      });
    });
  },

  unsubscribeFromTimeline: (activeSocket) => {
    const socket = activeSocket || useAuthStore.getState().socket;
    socket?.off("post:new");
  },

  getMessageRequests: async () => {
    const { data } = await axiosInstance.get("/conversations/requests");
    set({ messageRequests: data });
    return data;
  },

  respondToMessageRequest: async (conversationId, action) => {
    await axiosInstance.patch(`/conversations/requests/${conversationId}`, { action });
    set({
      messageRequests: get().messageRequests.filter((item) => item._id !== conversationId),
    });
  },
}));
