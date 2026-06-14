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

  return (
    <div className="fixed inset-0 z-[125] flex justify-end bg-black/45 md:top-16" onMouseDown={onClose}>
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={isVi ? "Thông tin đoạn chat" : "Chat information"}
        className="flex h-dvh w-full max-w-md flex-col overflow-hidden border-l border-base-300 bg-base-100 shadow-2xl md:h-[calc(100dvh-4rem)]"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="flex shrink-0 items-center justify-between border-b border-base-300 p-4">
          <h2 className="text-lg font-bold">{isVi ? "Thông tin đoạn chat" : "Chat information"}</h2>
          <button type="button" className="btn btn-circle btn-ghost btn-sm" onClick={onClose} aria-label={isVi ? "Đóng" : "Close"}>
            <X className="size-5" />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <div className="flex flex-col items-center text-center">
            <img src={selectedUser.profilePic || "/avatar.png"} alt="" className="size-24 rounded-full object-cover" />
            <h3 className="mt-3 text-xl font-bold">{selectedUser.fullName}</h3>
            <span className="mt-2 rounded-full bg-base-300 px-3 py-1 text-xs">
              {isVi ? "Được mã hóa đầu cuối" : "End-to-end encrypted"}
            </span>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-2">
            <QuickAction
              icon={User}
              label={isVi ? "Trang cá nhân" : "Profile"}
              onClick={() => navigate(`/profile/${selectedUser._id}`)}
            />
            <QuickAction
              icon={BellOff}
              label={isVi ? "Tắt thông báo" : "Mute"}
              onClick={() => updateConversationSetting(selectedUser._id, {
                mutedUntil: "9999-12-31T23:59:59.999Z",
              })}
            />
            <QuickAction
              icon={Search}
              label={isVi ? "Tìm kiếm" : "Search"}
              onClick={() => document.querySelector('[aria-label*="Tìm kiếm"]')?.focus()}
            />
          </div>
          <div className="mt-6 space-y-2">
            <Accordion title={isVi ? "Thông tin về đoạn chat" : "Chat details"} id="details" expanded={expanded} setExpanded={setExpanded}>
              <p className="text-sm text-base-content/70">{selectedUser.bio || (isVi ? "Chưa có thông tin bổ sung." : "No additional details.")}</p>
            </Accordion>
