import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import {
  Bell,
  LogOut,
  MessageCircle,
  Newspaper,
  Search,
  Settings,
  User,
  Users,
} from "lucide-react";
import { useLanguageStore } from "../store/useLanguageStore";
import { useEffect, useState } from "react";
import { useNotificationStore } from "../store/useNotificationStore";
import { useChatStore } from "../store/useChatStore";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();
  const { language } = useLanguageStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const { notifications, getNotifications, markAllRead } = useNotificationStore();
  const { users, setSelectedUser } = useChatStore();
  const unreadCount = notifications.filter((item) => !item.readAt).length;

  useEffect(() => {
    if (authUser) getNotifications();
  }, [authUser, getNotifications]);

  useEffect(() => {
    if (!showNotifications) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setShowNotifications(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [showNotifications]);

  return (
    <header className="fixed left-0 right-0 top-0 z-40 border-b border-base-300 bg-base-100/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between gap-2 px-3 sm:gap-4 sm:px-4">
        <div className="flex min-w-0 items-center gap-3">
          <Link to="/" className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-content" aria-label="PingMe">
            <MessageCircle className="size-6" />
          </Link>
          <label className="input input-sm flex h-10 w-60 items-center gap-2 rounded-full border-none bg-base-300 px-4 max-md:hidden">
            <Search className="size-4 text-base-content/60" />
            <input type="search" className="grow" placeholder={language === "vi" ? "Tìm kiếm trên PingMe" : "Search PingMe"} />
          </label>
        </div>

        <div className="relative flex shrink-0 items-center justify-end gap-1.5 sm:gap-2">
          {authUser && (
            <>
              <Link to="/contacts" className="btn btn-circle btn-sm border-none bg-base-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary" aria-label={language === "vi" ? "Danh bạ" : "Contacts"}>
                <Users className="size-5" />
              </Link>
              <Link to="/timeline" className="btn btn-circle btn-sm border-none bg-base-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary" aria-label={language === "vi" ? "Nhật ký" : "Timeline"}>
                <Newspaper className="size-5" />
              </Link>
            </>
          )}
          <Link to="/settings" className="btn btn-circle btn-sm border-none bg-base-300" aria-label={language === "vi" ? "Cài đặt" : "Settings"}>
            <Settings className="size-5" />
          </Link>
          {authUser && (
            <>
            <button
              type="button"
              className="btn btn-circle btn-sm relative border-none bg-base-300"
              onClick={() => setShowNotifications((value) => !value)}
              aria-label={language === "vi" ? "Thông báo" : "Notifications"}
              aria-expanded={showNotifications}
              aria-controls="pingme-notifications"
            >
              <Bell className="size-5" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex min-w-5 items-center justify-center rounded-full bg-error px-1 text-xs font-bold text-error-content">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>
            <Link to="/profile/me" className="btn btn-circle btn-sm border-none bg-base-300" aria-label={language === "vi" ? "Trang cá nhân" : "Profile"}>
              {authUser.profilePic ? <img src={authUser.profilePic} alt="" className="size-8 rounded-full object-cover" /> : <User className="size-5" />}
            </Link>
            <button type="button" className="btn btn-circle btn-sm border-none bg-base-300" onClick={logout} aria-label={language === "vi" ? "Đăng xuất" : "Log out"}>
              <LogOut className="size-5" />
            </button>
            </>
          )}
          {showNotifications && (
            <NotificationDropdown
              language={language}
              notifications={notifications}
              onReadAll={markAllRead}
              onOpen={(notification) => {
                const senderId = notification.senderId?._id || notification.senderId;
                const user = users.find((item) => item._id === senderId);
                if (user) setSelectedUser(user);
                setShowNotifications(false);
              }}
            />
          )}
        </div>
      </div>
    </header>
  );
};

const NotificationDropdown = ({ language, notifications, onReadAll, onOpen }) => (
  <div id="pingme-notifications" role="region" aria-label={language === "vi" ? "Thông báo PingMe" : "PingMe notifications"} className="absolute right-0 top-12 z-[120] w-[min(20rem,calc(100vw-1rem))] rounded-2xl border border-base-300 bg-base-100 p-4 shadow-2xl">
    <div className="mb-3 flex items-center justify-between gap-3">
      <div className="text-lg font-bold">{language === "vi" ? "Thông báo" : "Notifications"}</div>
      {notifications.some((item) => !item.readAt) && (
        <button type="button" className="btn btn-ghost btn-xs" onClick={onReadAll}>
          {language === "vi" ? "Đánh dấu đã đọc" : "Mark read"}
        </button>
      )}
    </div>
    <div className="max-h-96 space-y-1 overflow-y-auto">
      {notifications.length === 0 ? (
        <div className="rounded-xl bg-base-200 p-5 text-center text-sm text-base-content/60">
          {language === "vi" ? "Chưa có thông báo mới." : "No notifications yet."}
        </div>
      ) : notifications.map((item) => (
        <button key={item._id} type="button" className={`flex w-full gap-3 rounded-xl p-3 text-left hover:bg-base-200 ${item.readAt ? "" : "bg-primary/10"}`} onClick={() => onOpen(item)}>
          <img src={item.senderId?.profilePic || "/avatar.png"} alt="" className="size-10 rounded-full object-cover" />
          <span className="min-w-0 flex-1">
            <span className="block truncate font-bold">{item.senderId?.fullName || "PingMe"}</span>
            <span className="block truncate text-sm text-base-content/70">{item.preview}</span>
            <time className="text-xs text-base-content/50">{new Date(item.createdAt).toLocaleString(language === "vi" ? "vi-VN" : "en-US")}</time>
          </span>
        </button>
      ))}
    </div>
  </div>
);

export default Navbar;
