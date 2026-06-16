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
  const {
    messages,
    selectedUser,
    updateConversationSetting,
    getPinnedMessages,
    setMessagePinned,
  } = useChatStore();
  const [expanded, setExpanded] = useState("media");
  const [activeDialog, setActiveDialog] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [quickEmoji, setQuickEmoji] = useState("👍");
  const [readReceipts, setReadReceipts] = useState(true);
  const [disappearing, setDisappearing] = useState(false);
  const [pinnedMessages, setPinnedMessages] = useState([]);
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
  const searchedMessages = messages.filter((message) => {
    const keyword = searchQuery.trim().toLowerCase();
    if (!keyword) return false;
    return [
      message.text,
      message.replyTo?.preview,
      message.attachment?.name,
    ].filter(Boolean).some((value) => value.toLowerCase().includes(keyword));
  });
  const isMuted = selectedUser?.mutedUntil && new Date(selectedUser.mutedUntil) > new Date();

  useEffect(() => {
    if (!open) return undefined;
    const closeOnEscape = (event) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [onClose, open]);

  useEffect(() => {
    if (!open || !selectedUser) return;
    getPinnedMessages(selectedUser)
      .then(setPinnedMessages)
      .catch(() => setPinnedMessages(messages.filter((message) => message.pinned)));
  }, [getPinnedMessages, messages, open, selectedUser]);

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
      <ChatInfoDialog
        type={activeDialog}
        isVi={isVi}
        selectedUser={selectedUser}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchedMessages={searchedMessages}
        pinnedMessages={pinnedMessages}
        onUnpin={async (messageId) => {
          await setMessagePinned(messageId, false);
          setPinnedMessages((items) => items.filter((message) => message._id !== messageId));
        }}
        mediaMessages={mediaMessages}
        fileMessages={fileMessages}
        linkMessages={linkMessages}
        quickEmoji={quickEmoji}
        setQuickEmoji={setQuickEmoji}
        readReceipts={readReceipts}
        setReadReceipts={setReadReceipts}
        disappearing={disappearing}
        setDisappearing={setDisappearing}
        onClose={() => setActiveDialog(null)}
      />
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

const dialogTitles = {
  search: "Tìm kiếm trong đoạn chat",
  pinned: "Tin nhắn đã ghim",
  media: "Tệp phương tiện",
  files: "Tệp",
  links: "Liên kết",
  theme: "Đổi chủ đề",
  emoji: "Biểu tượng cảm xúc",
  nicknames: "Biệt danh",
  permissions: "Quyền nhắn tin",
  disappearing: "Tin nhắn tự hủy",
  receipts: "Thông báo đã đọc",
  encryption: "Xác minh mã hóa đầu cuối",
  restrict: "Hạn chế",
  block: "Chặn",
  report: "Báo cáo",
};

const messageLabel = (message) =>
  message.text || message.replyTo?.preview || message.attachment?.name || "Tin nhắn đa phương tiện";

const ChatInfoDialog = ({ type, isVi, onClose, ...props }) => {
  if (!type) return null;
  return (
    <div className="fixed inset-0 z-[170] flex items-center justify-center bg-black/60 p-3" onMouseDown={onClose}>
      <section
        role="dialog"
        aria-modal="true"
        aria-label={dialogTitles[type] || "Chi tiết đoạn chat"}
        className="max-h-[calc(100dvh-24px)] w-full max-w-lg overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-base-300 p-4">
          <h3 className="text-lg font-bold">{dialogTitles[type] || "Chi tiết đoạn chat"}</h3>
          <button type="button" className="btn btn-circle btn-ghost btn-sm" onClick={onClose} aria-label={isVi ? "Đóng" : "Close"}>
            <X className="size-5" />
          </button>
        </header>
        <div className="max-h-[70dvh] overflow-y-auto p-4">
          <ChatInfoDialogBody type={type} isVi={isVi} {...props} />
        </div>
      </section>
    </div>
  );
};

const ChatInfoDialogBody = ({ type, searchQuery, setSearchQuery, searchedMessages, pinnedMessages, onUnpin, mediaMessages, fileMessages, linkMessages, ...props }) => {
  if (type === "search") {
    return (
      <div className="space-y-3">
        <input className="input input-bordered w-full" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Tìm kiếm tin nhắn..." autoFocus />
        <MessageResultList messages={searchedMessages} empty="Nhập từ khóa để tìm trong đoạn chat." />
      </div>
    );
  }
  if (type === "pinned") return <MessageResultList messages={pinnedMessages} empty="Chưa có tin nhắn đã ghim." onUnpin={onUnpin} />;
  if (type === "media") return <AttachmentGrid messages={mediaMessages} empty="Chưa có ảnh hoặc video." />;
  if (type === "files") return <AttachmentList messages={fileMessages} empty="Chưa có tệp tài liệu." />;
  if (type === "links") return <MessageResultList messages={linkMessages} empty="Chưa có liên kết." />;
  return <ChatInfoSettingsBody type={type} {...props} />;
};

const MessageResultList = ({ messages, empty, onUnpin }) => (
  <div className="space-y-2">
    {messages.length === 0 ? <p className="text-sm text-base-content/60">{empty}</p> : messages.map((message) => (
      <div key={message._id} className="flex items-start justify-between gap-3 rounded-xl bg-base-200 p-3 text-sm">
        <div className="min-w-0">
          <p className="break-words">{messageLabel(message)}</p>
          <time className="mt-1 block text-xs text-base-content/50">{new Date(message.pinnedAt || message.createdAt).toLocaleString("vi-VN")}</time>
        </div>
        {onUnpin && (
          <button type="button" className="btn btn-ghost btn-xs shrink-0" onClick={() => onUnpin(message._id)}>
            Bỏ ghim
          </button>
        )}
      </div>
    ))}
  </div>
);

const AttachmentGrid = ({ messages, empty }) => (
  messages.length === 0 ? <p className="text-sm text-base-content/60">{empty}</p> : (
    <div className="grid grid-cols-2 gap-2">
      {messages.map((message) => {
        const url = message.image || message.attachment?.url;
        const isVideo = message.attachment?.type?.startsWith("video/");
        return (
          <a key={message._id} href={url} target="_blank" rel="noreferrer" className="overflow-hidden rounded-xl bg-base-200">
            {isVideo ? <video src={url} className="aspect-square w-full object-cover" /> : <img src={url} alt="" className="aspect-square w-full object-cover" />}
          </a>
        );
      })}
    </div>
  )
);

const AttachmentList = ({ messages, empty }) => (
  <div className="space-y-2">
    {messages.length === 0 ? <p className="text-sm text-base-content/60">{empty}</p> : messages.map((message) => (
      <a key={message._id} href={message.attachment.url} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-xl bg-base-200 p-3 hover:bg-base-300">
        <FileText className="size-5 shrink-0" />
        <span className="min-w-0 flex-1 truncate">{message.attachment.name || "Tệp đính kèm"}</span>
      </a>
    ))}
  </div>
);

const ChatInfoSettingsBody = ({ type, selectedUser, quickEmoji, setQuickEmoji, readReceipts, setReadReceipts, disappearing, setDisappearing }) => {
  if (type === "theme") {
    return <div className="grid grid-cols-2 gap-2">{["coffee", "night", "valentine", "aqua"].map((theme) => <button key={theme} type="button" className="rounded-xl bg-base-200 p-4 text-left font-semibold hover:bg-base-300">{theme}</button>)}</div>;
  }
  if (type === "emoji") {
    return <div className="grid grid-cols-6 gap-2">{["👍", "❤️", "😂", "😮", "😢", "🎉", "🙏", "🔥", "😍", "👏", "💯", "✅"].map((emoji) => <button key={emoji} type="button" className={`rounded-xl p-3 text-2xl hover:bg-base-200 ${quickEmoji === emoji ? "bg-primary/20" : ""}`} onClick={() => setQuickEmoji(emoji)}>{emoji}</button>)}</div>;
  }
  if (type === "nicknames") {
    return <div className="space-y-3"><NicknameRow name={selectedUser.fullName} /><NicknameRow name="Bạn" /></div>;
  }
  if (type === "permissions") {
    return <ToggleRow label="Cho phép nhận tin nhắn" checked description="Kiểm soát việc đoạn chat này có thể tiếp tục gửi tin nhắn cho bạn." />;
  }
  if (type === "disappearing") {
    return <ToggleRow label="Tin nhắn tự hủy sau 24 giờ" checked={disappearing} onChange={setDisappearing} />;
  }
  if (type === "receipts") {
    return <ToggleRow label="Hiển thị thông báo đã đọc" checked={readReceipts} onChange={setReadReceipts} />;
  }
  return <SupportAction type={type} selectedUser={selectedUser} />;
};

const ToggleRow = ({ label, checked, onChange = () => {}, description }) => (
  <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl bg-base-200 p-4">
    <span>
      <span className="block font-semibold">{label}</span>
      {description && <span className="text-sm text-base-content/60">{description}</span>}
    </span>
    <input type="checkbox" className="toggle toggle-primary" checked={checked} onChange={(event) => onChange(event.target.checked)} />
  </label>
);

const NicknameRow = ({ name }) => (
  <div className="flex items-center justify-between rounded-xl bg-base-200 p-3">
    <span className="font-semibold">{name}</span>
    <button type="button" className="btn btn-circle btn-ghost btn-sm" aria-label={`Sửa biệt danh ${name}`}>
      <Edit3 className="size-4" />
    </button>
  </div>
);

const SupportAction = ({ type, selectedUser }) => {
  const copy = {
    encryption: `Đoạn chat với ${selectedUser.fullName} được bảo vệ bằng lớp xác minh mã hóa trong PingMe.`,
    restrict: `Bạn có thể hạn chế ${selectedUser.fullName}; họ sẽ không biết khi bạn online hoặc đã đọc tin nhắn.`,
    block: `Chặn ${selectedUser.fullName} sẽ ngăn họ tiếp tục liên hệ với bạn trên PingMe.`,
    report: "Báo cáo này sẽ được gửi tới quản trị viên PingMe để xem xét.",
  };
  return <p className="rounded-xl bg-base-200 p-4 text-sm text-base-content/75">{copy[type] || "Tính năng này đang được chuẩn hóa."}</p>;
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
