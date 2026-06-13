import { useEffect, useMemo, useRef, useState } from "react";
import { Search, Send, X } from "lucide-react";
import toast from "react-hot-toast";
import { useChatStore } from "../store/useChatStore";
import { useLanguageStore } from "../store/useLanguageStore";

const NewMessageComposer = () => {
  const {
    users,
    isNewMessageOpen,
    closeNewMessage,
    sendMessageTo,
    setSelectedUser,
  } = useChatStore();
  const { language } = useLanguageStore();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState([]);
  const [text, setText] = useState("");
  const inputRef = useRef(null);
  const isVi = language === "vi";

  const visibleUsers = useMemo(() => {
    const search = query.trim().toLowerCase();
    return users.filter((user) => !search || `${user.fullName} ${user.email || ""}`.toLowerCase().includes(search));
  }, [query, users]);

  useEffect(() => {
    if (!isNewMessageOpen) return undefined;
    inputRef.current?.focus();
    const closeOnEscape = (event) => {
      if (event.key === "Escape") closeNewMessage();
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [closeNewMessage, isNewMessageOpen]);

  if (!isNewMessageOpen) return null;

  const toggleUser = (user) => {
    setSelected((current) =>
      current.some((item) => item._id === user._id)
        ? current.filter((item) => item._id !== user._id)
        : [...current, user]
    );
    setQuery("");
    inputRef.current?.focus();
  };

  const sendFirstMessage = async (event) => {
    event.preventDefault();
    if (!selected.length || !text.trim()) return;
    try {
      const sent = await Promise.all(selected.map((user) => sendMessageTo(user._id, { text: text.trim() })));
      const firstUser = selected[0];
      setSelectedUser(firstUser);
      useChatStore.setState({ messages: selected.length === 1 ? [sent[0]] : [] });
      setSelected([]);
      setText("");
      closeNewMessage();
      toast.success(isVi ? "Đã gửi tin nhắn" : "Message sent");
    } catch {
      toast.error(isVi ? "Không gửi được tin nhắn" : "Could not send message");
    }
  };
