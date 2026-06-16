import {
  Bell,
  BellOff,
  Ban,
  Eye,
  Edit3,
  FileText,
  Image,
  Link as LinkIcon,
  Palette,
  Pin,
  Search,
  Shield,
  Smile,
  TimerReset,
  User,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useChatStore } from "../store/useChatStore";
import { useLanguageStore } from "../store/useLanguageStore";

const ChatInfoPanel = ({ open, onClose }) => {
  const navigate = useNavigate();
  const { language } = useLanguageStore();
  const { messages, selectedUser, updateConversationSetting } = useChatStore();
  const [expanded, setExpanded] = useState("media");
  const [activeDialog, setActiveDialog] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [quickEmoji, setQuickEmoji] = useState("👍");
  const [readReceipts, setReadReceipts] = useState(true);
  const [disappearing, setDisappearing] = useState(false);
  const isVi = language === "vi";

  const attachments = useMemo(
    () => messages.filter((message) => message.image || message.attachment?.url),
    [messages]
  );
  const mediaMessages = attachments.filter((message) =>
    message.image || message.attachment?.type?.startsWith("image/") || message.attachment?.type?.startsWith("video/")
  );
  const fileMessages = attachments.filter((message) =>
    message.attachment?.url && !message.attachment?.type?.startsWith("image/") && !message.attachment?.type?.startsWith("video/")
  );
  const linkMessages = messages.filter((message) => /https?:\/\/\S+/i.test(message.text || ""));
  const pinnedMessages = messages.filter((message) => message.pinned);
  const isMuted = selectedUser?.mutedUntil && new Date(selectedUser.mutedUntil) > new Date();

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
              icon={isMuted ? Bell : BellOff}
              label={isMuted ? (isVi ? "Bật thông báo" : "Unmute") : (isVi ? "Tắt thông báo" : "Mute")}
              onClick={() => updateConversationSetting(selectedUser._id, {
                mutedUntil: isMuted ? null : "9999-12-31T23:59:59.999Z",
              })}
            />
            <QuickAction
              icon={Search}
              label={isVi ? "Tìm kiếm" : "Search"}
              onClick={() => setActiveDialog("search")}
            />
          </div>
          <div className="mt-6 space-y-2">
            <Accordion title={isVi ? "Thông tin về đoạn chat" : "Chat details"} id="details" expanded={expanded} setExpanded={setExpanded}>
              <InfoRow icon={Pin} label={isVi ? "Xem tin nhắn đã ghim" : "View pinned messages"} onClick={() => setActiveDialog("pinned")} />
              <p className="px-2 py-2 text-sm text-base-content/70">{selectedUser.bio || (isVi ? "Chưa có thông tin bổ sung." : "No additional details.")}</p>
            </Accordion>
            <Accordion title={isVi ? "Tùy chỉnh đoạn chat" : "Customize chat"} id="customize" expanded={expanded} setExpanded={setExpanded}>
              <InfoRow icon={Palette} label={isVi ? "Đổi chủ đề" : "Change theme"} onClick={() => setActiveDialog("theme")} />
              <InfoRow icon={Smile} label={isVi ? "Thay đổi biểu tượng cảm xúc" : "Change quick emoji"} onClick={() => setActiveDialog("emoji")} />
              <InfoRow icon={Edit3} label={isVi ? "Chỉnh sửa biệt danh" : "Edit nicknames"} onClick={() => setActiveDialog("nicknames")} />
            </Accordion>
            <Accordion title={isVi ? "File phương tiện và file" : "Media and files"} id="media" expanded={expanded} setExpanded={setExpanded}>
              <InfoRow icon={Image} label={`${isVi ? "Tệp phương tiện" : "Media"} (${mediaMessages.length})`} onClick={() => setActiveDialog("media")} />
              <InfoRow icon={FileText} label={`${isVi ? "Tệp" : "Files"} (${fileMessages.length})`} onClick={() => setActiveDialog("files")} />
              <InfoRow icon={LinkIcon} label={`${isVi ? "Liên kết" : "Links"} (${linkMessages.length})`} onClick={() => setActiveDialog("links")} />
            </Accordion>
            <Accordion title={isVi ? "Quyền riêng tư và hỗ trợ" : "Privacy and support"} id="privacy" expanded={expanded} setExpanded={setExpanded}>
              <InfoRow icon={BellOff} label={isMuted ? (isVi ? "Bật thông báo" : "Unmute") : (isVi ? "Tắt thông báo" : "Mute")} onClick={() => updateConversationSetting(selectedUser._id, { mutedUntil: isMuted ? null : "9999-12-31T23:59:59.999Z" })} />
              <InfoRow icon={Shield} label={isVi ? "Quyền nhắn tin" : "Messaging permissions"} onClick={() => setActiveDialog("permissions")} />
              <InfoRow icon={TimerReset} label={isVi ? "Tin nhắn tự hủy" : "Disappearing messages"} onClick={() => setActiveDialog("disappearing")} />
              <InfoRow icon={Eye} label={`${isVi ? "Thông báo đã đọc" : "Read receipts"}: ${readReceipts ? (isVi ? "Bật" : "On") : (isVi ? "Tắt" : "Off")}`} onClick={() => setActiveDialog("receipts")} />
              <InfoRow icon={Shield} label={isVi ? "Xác minh mã hóa đầu cuối" : "Verify encryption"} onClick={() => setActiveDialog("encryption")} />
              <InfoRow icon={Ban} label={isVi ? "Hạn chế" : "Restrict"} onClick={() => setActiveDialog("restrict")} />
              <InfoRow icon={Ban} label={isVi ? "Chặn" : "Block"} danger onClick={() => setActiveDialog("block")} />
              <InfoRow icon={Shield} label={isVi ? "Báo cáo" : "Report"} danger onClick={() => setActiveDialog("report")} />
            </Accordion>
          </div>
        </div>
      </aside>
    </div>
  );
};

const QuickAction = ({ icon: Icon, label, onClick }) => (
  <button type="button" className="flex min-h-20 flex-col items-center justify-center gap-2 rounded-xl bg-base-200 p-2 text-xs font-semibold hover:bg-base-300" onClick={onClick}>
    <Icon className="size-5" />
    <span className="line-clamp-2">{label}</span>
  </button>
);

const Accordion = ({ title, id, expanded, setExpanded, children }) => {
  const open = expanded === id;
  return (
    <section className="border-b border-base-300 py-1">
      <button
        type="button"
        className="flex min-h-11 w-full items-center justify-between gap-3 py-2 text-left font-bold"
        onClick={() => setExpanded(open ? null : id)}
        aria-expanded={open}
      >
        {title}
        <span aria-hidden="true">{open ? "−" : "+"}</span>
      </button>
      {open && <div className="pb-3">{children}</div>}
    </section>
  );
};

const InfoRow = ({ icon: Icon, label, danger = false, onClick }) => (
  <button
    type="button"
    className={`flex min-h-11 w-full items-center gap-3 rounded-lg px-2 text-left text-sm hover:bg-base-200 ${danger ? "text-error" : ""}`}
    onClick={onClick}
  >
    {Icon && <Icon className="size-4 shrink-0" />}
    {label}
  </button>
);

export default ChatInfoPanel;
