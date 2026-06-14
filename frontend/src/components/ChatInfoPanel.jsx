import { BellOff, FileText, Image, Search, User, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useChatStore } from "../store/useChatStore";
import { useLanguageStore } from "../store/useLanguageStore";

const ChatInfoPanel = ({ open, onClose }) => {
  const navigate = useNavigate();
  const { language } = useLanguageStore();
  const { messages, selectedUser, updateConversationSetting } = useChatStore();
  const [expanded, setExpanded] = useState("media");
  const isVi = language === "vi";

  const attachments = useMemo(
    () => messages.filter((message) => message.image || message.attachment?.url),
    [messages]
  );

  useEffect(() => {
    if (!open) return undefined;
    const closeOnEscape = (event) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [onClose, open]);

  if (!open || !selectedUser) return null;
