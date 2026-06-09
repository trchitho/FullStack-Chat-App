import { create } from "zustand";

export const languages = {
  vi: "Tiếng Việt",
  en: "English",
};

export const useLanguageStore = create((set) => ({
  language: localStorage.getItem("app-language") || "vi",
  setLanguage: (language) => {
    localStorage.setItem("app-language", language);
    set({ language });
  },
}));
