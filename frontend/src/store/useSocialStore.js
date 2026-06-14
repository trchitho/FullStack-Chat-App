import { create } from "zustand";
import toast from "react-hot-toast";
import axiosInstance from "../lib/axios";

export const useSocialStore = create((set, get) => ({
  profile: null,
  relationship: { status: "none" },
  friends: [],
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
}));
