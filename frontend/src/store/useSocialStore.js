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
}));
