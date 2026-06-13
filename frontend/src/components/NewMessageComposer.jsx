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
