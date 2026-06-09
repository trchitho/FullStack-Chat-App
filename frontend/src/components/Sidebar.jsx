import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  BellOff,
  MoreHorizontal,
  Pencil,
  Search,
} from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { chatFilters, sidebarMenuItems, userCardActions } from "../constants/chatUi";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { closeFloatingMenus, FLOATING_MENU_CLOSE_EVENT } from "../lib/menuEvents";
import { useLanguageStore } from "../store/useLanguageStore";
import { t } from "../lib/i18n";
import toast from "react-hot-toast";

const sidebarActionStorageKey = "pingme-sidebar-user-actions";
const reportStorageKey = "pingme-sidebar-user-reports";

const readStoredActions = () => {
  try {
    return JSON.parse(localStorage.getItem(sidebarActionStorageKey)) || {};
  } catch {
    return {};
  }
};

const toggleStoredId = (actions, key, id) => {
  const current = new Set(actions[key] || []);
  current.has(id) ? current.delete(id) : current.add(id);
  return { ...actions, [key]: [...current] };
};

const addStoredId = (actions, key, id) => ({
  ...actions,
  [key]: [...new Set([...(actions[key] || []), id])],
});

const setMutedUntil = (actions, userId, minutes) => ({
  ...actions,
  muted: [...new Set([...(actions.muted || []), userId])],
  mutedUntil: {
    ...(actions.mutedUntil || {}),
    [userId]: minutes ? Date.now() + minutes * 60 * 1000 : null,
  },
});

const Sidebar = ({ onOpenPanel = () => {} }) => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading, sendCallEvent } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const { language } = useLanguageStore();
  const [activeFilter, setActiveFilter] = useState("all");
  const [openUserMenu, setOpenUserMenu] = useState(null);
  const [userMenuPosition, setUserMenuPosition] = useState(null);
  const [showMainMenu, setShowMainMenu] = useState(false);
  const [mainMenuPosition, setMainMenuPosition] = useState(null);
  const [query, setQuery] = useState("");
  const [userActions, setUserActions] = useState(() => readStoredActions());
  const [profileUser, setProfileUser] = useState(null);
  const [callState, setCallState] = useState(null);
  const [reportUser, setReportUser] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [muteUser, setMuteUser] = useState(null);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  useEffect(() => {
    localStorage.setItem(sidebarActionStorageKey, JSON.stringify(userActions));
  }, [userActions]);

  const openConfirmAction = (type, user) => {
    setConfirmAction({ type, user });
  };

  const handleUserAction = (labelKey, user) => {
    closeFloatingMenus();
    setOpenUserMenu(null);
    if (labelKey === "markUnread") {
      setUserActions((actions) => toggleStoredId(actions, "unread", user._id));
      toast.success(language === "vi" ? "Đã cập nhật trạng thái chưa đọc" : "Unread state updated");
    }
    if (labelKey === "mute") {
      setMuteUser(user);
    }
    if (labelKey === "viewProfile") setProfileUser(user);
    if (labelKey === "voiceCall") setCallState({ user, type: "voice" });
    if (labelKey === "videoChat") setCallState({ user, type: "video" });
    if (labelKey === "block") openConfirmAction("block", user);
    if (labelKey === "archiveChat") openConfirmAction("archive", user);
    if (labelKey === "deleteChat") openConfirmAction("delete", user);
    if (labelKey === "report") setReportUser(user);
  };

  const confirmSelectedAction = () => {
    if (!confirmAction) return;
    const actionKey = confirmAction.type === "archive" ? "archived" : confirmAction.type === "block" ? "blocked" : "deleted";
    setUserActions((actions) => addStoredId(actions, actionKey, confirmAction.user._id));
    if (selectedUser?._id === confirmAction.user._id) setSelectedUser(null);
    toast.success(language === "vi" ? "Đã cập nhật đoạn chat" : "Chat updated");
    setConfirmAction(null);
  };

  useEffect(() => {
    const closeMenus = () => {
      setShowMainMenu(false);
      setOpenUserMenu(null);
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") closeMenus();
    };
    const closeOnOutsideClick = (event) => {
      if (!event.target.closest("[data-pingme-floating-menu], [data-pingme-menu-trigger]")) closeMenus();
    };
    window.addEventListener(FLOATING_MENU_CLOSE_EVENT, closeMenus);
    document.addEventListener("keydown", closeOnEscape);
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => {
      window.removeEventListener(FLOATING_MENU_CLOSE_EVENT, closeMenus);
      document.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("mousedown", closeOnOutsideClick);
    };
  }, []);

  const filteredUsers = useMemo(() => {
    const search = query.trim().toLowerCase();
    const hiddenIds = new Set([
      ...(userActions.archived || []),
      ...(userActions.blocked || []),
      ...(userActions.deleted || []),
    ]);
    const unreadIds = new Set(userActions.unread || []);

    return users.filter((user) => {
      if (hiddenIds.has(user._id)) return false;
      const matchesSearch = user.fullName.toLowerCase().includes(search);
      if (!matchesSearch) return false;
      if (activeFilter === "unread") return user.unread || unreadIds.has(user._id);
      if (activeFilter === "groups") return user.isGroup;
      return true;
    });
  }, [activeFilter, query, userActions, users]);

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <>
    <aside className="relative flex h-full w-[360px] max-w-full shrink-0 flex-col overflow-x-hidden border-r border-base-300 bg-base-200 max-lg:w-[92px]">
      <div className="min-w-0 space-y-4 border-b border-base-300 p-4 max-lg:px-3">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-3xl font-bold tracking-tight max-lg:hidden">{t(language, "chats")}</h1>
          <div className="flex gap-2">
            <button
              type="button"
              data-pingme-menu-trigger
              className="btn btn-circle btn-sm border-none bg-base-300"
              onClick={(event) => {
                const rect = event.currentTarget.getBoundingClientRect();
                const shouldOpen = !showMainMenu;
                closeFloatingMenus();
                setMainMenuPosition({
                  top: rect.bottom + 10,
                  left: Math.min(rect.left, window.innerWidth - 360),
                });
                setShowMainMenu(shouldOpen);
              }}
              aria-label="Mở tùy chọn đoạn chat"
            >
              <MoreHorizontal className="size-5" />
            </button>
            <button type="button" className="btn btn-circle btn-sm border-none bg-base-300" aria-label="Soạn tin nhắn">
              <Pencil className="size-4" />
            </button>
          </div>
        </div>

        <label className="input input-sm flex h-11 items-center gap-2 rounded-full border-none bg-base-300 px-4 max-lg:hidden">
          <Search className="size-5 text-base-content/60" />
          <input
            type="search"
            className="grow"
            placeholder={t(language, "searchUsers")}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>

        <div className="flex items-center gap-2 max-lg:hidden">
          {chatFilters.map((filter) => (
            <button
              key={filter.id}
              type="button"
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                activeFilter === filter.id ? "bg-primary/20 text-primary" : "hover:bg-base-300"
              }`}
              onClick={() => setActiveFilter(filter.id)}
            >
              {t(language, filter.labelKey)}
            </button>
          ))}
        </div>
      </div>

      {showMainMenu && mainMenuPosition && createPortal(
        <MainSidebarMenu position={mainMenuPosition} onOpenPanel={onOpenPanel} language={language} />,
        document.body
      )}

      <div className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto p-2">
        {filteredUsers.map((user) => {
          const isOnline = onlineUsers.includes(user._id);
          const isSelected = selectedUser?._id === user._id;
          const isMarkedUnread = (userActions.unread || []).includes(user._id);
          const isMuted = (userActions.muted || []).includes(user._id);

          return (
            <div key={user._id} className="group relative min-w-0">
              <button
                type="button"
                onClick={() => setSelectedUser(user)}
                className={`flex w-full min-w-0 items-center gap-3 rounded-xl p-3 text-left transition ${
                  isSelected ? "bg-primary/15" : "hover:bg-base-300"
                }`}
              >
                <div className="avatar relative shrink-0">
                  <div className="size-14 rounded-full">
                    <img src={user.profilePic || "/avatar.png"} alt={user.fullName} />
                  </div>
                  {isOnline && <span className="absolute bottom-1 right-0 size-3.5 rounded-full border-2 border-base-200 bg-success" />}
                </div>
                <div className="min-w-0 flex-1 max-lg:hidden">
                  <div className={`truncate font-semibold ${isMarkedUnread ? "text-primary" : ""}`}>{user.fullName}</div>
                  <div className={`truncate text-sm ${isMarkedUnread ? "font-bold text-base-content" : "text-base-content/60"}`}>
                    {isMuted ? (language === "vi" ? "Đã tắt thông báo" : "Muted") : user.lastMessageText || (isOnline ? t(language, "activeNow") : t(language, "noMessages"))}
                  </div>
                </div>
                {isMuted && <BellOff className="size-4 shrink-0 text-base-content/50 max-lg:hidden" />}
                {isMarkedUnread && <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-primary-content max-lg:hidden">Mới</span>}
              </button>

              <button
                type="button"
                data-pingme-menu-trigger
                className="absolute right-3 top-5 rounded-full bg-base-300 p-2 opacity-80 shadow transition hover:opacity-100 max-lg:hidden"
                onClick={(event) => {
                  const rect = event.currentTarget.getBoundingClientRect();
                  const shouldOpen = openUserMenu !== user._id;
                  closeFloatingMenus();
                  setUserMenuPosition({
                    top: Math.min(rect.bottom + 6, window.innerHeight - 306),
                    left: Math.min(rect.left - 150, window.innerWidth - 242),
                  });
                  setOpenUserMenu(shouldOpen ? user._id : null);
                }}
                aria-label={`Mở tùy chọn ${user.fullName}`}
              >
                <MoreHorizontal className="size-4" />
              </button>

              {openUserMenu === user._id && userMenuPosition && createPortal(
                <UserActionMenu position={userMenuPosition} language={language} user={user} onAction={handleUserAction} />,
                document.body
              )}
            </div>
          );
        })}

        {filteredUsers.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-base-content/60 max-lg:hidden">
            Không tìm thấy đoạn chat phù hợp.
          </div>
        )}
      </div>
    </aside>
      {profileUser && (
        <SimpleModal title={language === "vi" ? "Trang cá nhân" : "Profile"} onClose={() => setProfileUser(null)}>
          <div className="flex items-center gap-4">
            <img src={profileUser.profilePic || "/avatar.png"} alt="" className="size-16 rounded-full object-cover" />
            <div>
              <div className="text-xl font-bold">{profileUser.fullName}</div>
              <div className="text-sm text-base-content/60">{onlineUsers.includes(profileUser._id) ? t(language, "activeNow") : t(language, "inactive")}</div>
            </div>
          </div>
        </SimpleModal>
      )}
      {confirmAction && (
        <ConfirmChatAction action={confirmAction} language={language} onCancel={() => setConfirmAction(null)} onConfirm={confirmSelectedAction} />
      )}
      {callState && <CallDialog callState={callState} language={language} onClose={() => setCallState(null)} onSave={sendCallEvent} />}
      {reportUser && <ReportDialog user={reportUser} language={language} onClose={() => setReportUser(null)} />}
      {muteUser && (
        <MuteDialog
          language={language}
          onClose={() => setMuteUser(null)}
          onConfirm={(minutes) => {
            setUserActions((actions) => setMutedUntil(actions, muteUser._id, minutes));
            toast.success(language === "vi" ? "Đã tắt thông báo" : "Notifications muted");
            setMuteUser(null);
          }}
        />
      )}
    </>
  );
};

const MainSidebarMenu = ({ position, onOpenPanel, language }) => (
  <div
    data-pingme-floating-menu
    className="fixed z-[110] w-64 rounded-xl border border-base-300 bg-base-100 p-1.5 text-sm shadow-2xl"
    style={{ top: Math.max(8, position.top), left: Math.max(8, position.left) }}
  >
    {sidebarMenuItems.map(({ id, labelKey, icon: Icon }, index) => (
      <div key={id}>
        {(index === 1 || index === 4 || index === 5) && <div className="my-1 h-px bg-base-300" />}
        <button
          type="button"
          className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-left font-semibold hover:bg-base-300"
          onClick={() => {
            closeFloatingMenus();
            if (id === "help") {
              window.open("/help/messages-app/", "_blank", "noopener,noreferrer");
              return;
            }
            onOpenPanel(id);
          }}
        >
          <Icon className="size-4 shrink-0" />
          {t(language, labelKey)}
        </button>
      </div>
    ))}
  </div>
);

const SimpleModal = ({ title, children, onClose }) => (
  <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
    <div className="w-full max-w-md rounded-2xl border border-base-300 bg-base-100 p-5 shadow-2xl" onClick={(event) => event.stopPropagation()}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold">{title}</h2>
        <button type="button" className="btn btn-circle btn-ghost btn-sm" onClick={onClose}>✕</button>
      </div>
      {children}
    </div>
  </div>
);

const ConfirmChatAction = ({ action, language, onCancel, onConfirm }) => {
  const labels = {
    archive: language === "vi" ? ["Lưu trữ đoạn chat", "Đoạn chat sẽ được ẩn khỏi danh sách hiện tại."] : ["Archive chat", "This chat will be hidden from the current list."],
    block: language === "vi" ? ["Chặn tài khoản", "Bạn sẽ không thấy đoạn chat này trong danh sách nữa."] : ["Block account", "You will no longer see this chat in the list."],
    delete: language === "vi" ? ["Xóa đoạn chat", "Đoạn chat sẽ bị gỡ khỏi danh sách của bạn."] : ["Delete chat", "This chat will be removed from your list."],
  };
  const [title, body] = labels[action.type];
  return (
    <SimpleModal title={title} onClose={onCancel}>
      <p className="text-base-content/70">{body}</p>
      <div className="mt-5 flex justify-end gap-2">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>{language === "vi" ? "Hủy" : "Cancel"}</button>
        <button type="button" className="btn btn-primary" onClick={onConfirm}>{language === "vi" ? "Xác nhận" : "Confirm"}</button>
      </div>
    </SimpleModal>
  );
};

const MuteDialog = ({ language, onClose, onConfirm }) => {
  const [minutes, setMinutes] = useState(60);
  const options = [
    [15, language === "vi" ? "Trong 15 phút" : "For 15 minutes"],
    [60, language === "vi" ? "Trong 1 giờ" : "For 1 hour"],
    [480, language === "vi" ? "Trong 8 giờ" : "For 8 hours"],
    [1440, language === "vi" ? "Trong 24 giờ" : "For 24 hours"],
    [null, language === "vi" ? "Đến khi tắt" : "Until turned off"],
  ];
  return (
    <SimpleModal title={language === "vi" ? "Tắt thông báo" : "Mute notifications"} onClose={onClose}>
      <p className="mb-4 text-sm text-base-content/70">{language === "vi" ? "Cửa sổ chat vẫn đóng và bạn sẽ không nhận được thông báo đẩy trên thiết bị." : "Chat windows stay closed and you will not receive push notifications on this device."}</p>
      <div className="space-y-2">
        {options.map(([value, label]) => (
          <label key={label} className="flex cursor-pointer items-center justify-between rounded-xl p-3 font-semibold hover:bg-base-200">
            {label}
            <input type="radio" className="radio radio-primary" checked={minutes === value} onChange={() => setMinutes(value)} />
          </label>
        ))}
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <button type="button" className="btn btn-ghost" onClick={onClose}>{language === "vi" ? "Hủy" : "Cancel"}</button>
        <button type="button" className="btn btn-primary" onClick={() => onConfirm(minutes)}>{language === "vi" ? "Tiếp" : "Next"}</button>
      </div>
    </SimpleModal>
  );
};

const CallDialog = ({ callState, language, onClose, onSave }) => {
  const videoRef = useRef(null);
  const [status, setStatus] = useState(language === "vi" ? "Đang xin quyền thiết bị..." : "Requesting device access...");
  const startedAtRef = useRef(Date.now());

  useEffect(() => {
    let stream;
    navigator.mediaDevices.getUserMedia({ audio: true, video: callState.type === "video" })
      .then((mediaStream) => {
        stream = mediaStream;
        if (videoRef.current) videoRef.current.srcObject = mediaStream;
        setStatus(language === "vi" ? "Cuộc gọi đang sẵn sàng" : "Call is ready");
      })
      .catch(() => setStatus(language === "vi" ? "Không thể mở thiết bị" : "Could not open device"));
    return () => stream?.getTracks().forEach((track) => track.stop());
  }, [callState.type, language]);

  const endCall = async () => {
    const duration = Math.max(1, Math.round((Date.now() - startedAtRef.current) / 1000));
    await onSave(callState.user._id, { type: callState.type, status: "completed", duration });
    onClose();
  };

  return (
    <SimpleModal title={callState.type === "video" ? t(language, "videoChat") : t(language, "voiceCall")} onClose={onClose}>
      <div className="space-y-4 text-center">
        <img src={callState.user.profilePic || "/avatar.png"} alt="" className="mx-auto size-20 rounded-full object-cover" />
        <div className="text-xl font-bold">{callState.user.fullName}</div>
        {callState.type === "video" && <video ref={videoRef} autoPlay muted playsInline className="mx-auto aspect-video w-full rounded-xl bg-black object-cover" />}
        <p className="text-sm text-base-content/70">{status}</p>
        <button type="button" className="btn btn-error" onClick={endCall}>{language === "vi" ? "Kết thúc" : "End"}</button>
      </div>
    </SimpleModal>
  );
};

const ReportDialog = ({ user, language, onClose }) => {
  const [reason, setReason] = useState("spam");
  const reasons = language === "vi"
    ? { spam: "Spam", abuse: "Quấy rối", scam: "Lừa đảo" }
    : { spam: "Spam", abuse: "Harassment", scam: "Scam" };
  const submitReport = () => {
    const reports = JSON.parse(localStorage.getItem(reportStorageKey) || "[]");
    localStorage.setItem(reportStorageKey, JSON.stringify([...reports, { userId: user._id, reason, at: new Date().toISOString() }]));
    toast.success(language === "vi" ? "Đã gửi báo cáo" : "Report submitted");
    onClose();
  };

  return (
    <SimpleModal title={t(language, "report")} onClose={onClose}>
      <div className="space-y-3">
        <p className="text-sm text-base-content/70">{language === "vi" ? `Báo cáo đoạn chat với ${user.fullName}` : `Report chat with ${user.fullName}`}</p>
        {Object.entries(reasons).map(([id, label]) => (
          <label key={id} className="flex cursor-pointer items-center gap-3 rounded-xl bg-base-200 p-3">
            <input type="radio" className="radio radio-primary radio-sm" checked={reason === id} onChange={() => setReason(id)} />
            <span className="font-semibold">{label}</span>
          </label>
        ))}
        <button type="button" className="btn btn-primary w-full" onClick={submitReport}>{language === "vi" ? "Gửi báo cáo" : "Submit report"}</button>
      </div>
    </SimpleModal>
  );
};

const UserActionMenu = ({ position, language, user, onAction }) => (
  <div
    data-pingme-floating-menu
    className="fixed z-[110] max-h-[calc(100dvh-16px)] w-56 overflow-y-auto rounded-xl border border-base-300 bg-base-100 p-1 text-sm shadow-2xl"
    style={{ top: Math.max(8, position.top), left: Math.max(8, position.left) }}
  >
    {userCardActions.map(({ labelKey, icon: Icon }) => (
      <button key={labelKey} type="button" className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left font-semibold hover:bg-base-300" onClick={() => onAction(labelKey, user)}>
        <Icon className="size-4 shrink-0" />
        {t(language, labelKey)}
      </button>
    ))}
  </div>
);

export default Sidebar;
