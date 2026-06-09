import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import {
  Bell,
  LogOut,
  MessageCircle,
  Search,
  Settings,
  User,
} from "lucide-react";
import { useLanguageStore } from "../store/useLanguageStore";
import { useState } from "react";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();
  const { language } = useLanguageStore();
  const [showNotifications, setShowNotifications] = useState(false);

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
          <Link to="/settings" className="btn btn-circle btn-sm border-none bg-base-300" aria-label={language === "vi" ? "Cài đặt" : "Settings"}>
            <Settings className="size-5" />
          </Link>
          {authUser && (
            <>
            <button type="button" className="btn btn-circle btn-sm border-none bg-base-300" onClick={() => setShowNotifications((value) => !value)} aria-label={language === "vi" ? "Thông báo" : "Notifications"}>
              <Bell className="size-5" />
            </button>
            <Link to="/profile" className="btn btn-circle btn-sm border-none bg-base-300" aria-label={language === "vi" ? "Trang cá nhân" : "Profile"}>
              {authUser.profilePic ? <img src={authUser.profilePic} alt="" className="size-8 rounded-full object-cover" /> : <User className="size-5" />}
            </Link>
            <button type="button" className="btn btn-circle btn-sm border-none bg-base-300" onClick={logout} aria-label={language === "vi" ? "Đăng xuất" : "Log out"}>
              <LogOut className="size-5" />
            </button>
            </>
          )}
          {showNotifications && <NotificationDropdown language={language} />}
        </div>
      </div>
    </header>
  );
};

const NotificationDropdown = ({ language }) => (
  <div className="absolute right-0 top-12 z-[120] w-[min(20rem,calc(100vw-1rem))] rounded-2xl border border-base-300 bg-base-100 p-4 shadow-2xl">
    <div className="mb-3 text-lg font-bold">{language === "vi" ? "Thông báo" : "Notifications"}</div>
    <div className="rounded-xl bg-base-200 p-3">
      <div className="font-semibold">{language === "vi" ? "PingMe đang hoạt động" : "PingMe is active"}</div>
      <div className="text-sm text-base-content/60">
        {language === "vi" ? "Bạn sẽ thấy thông báo tin nhắn, cuộc gọi và hoạt động hệ thống tại đây." : "Message, call, and system activity notifications will appear here."}
      </div>
    </div>
  </div>
);

export default Navbar;
