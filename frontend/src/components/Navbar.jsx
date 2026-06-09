import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import {
  Bell,
  MessageCircle,
  Search,
} from "lucide-react";
import { useLanguageStore } from "../store/useLanguageStore";

const Navbar = () => {
  const { authUser } = useAuthStore();
  const { language } = useLanguageStore();

  return (
    <header className="fixed left-0 right-0 top-0 z-40 border-b border-base-300 bg-base-100/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex size-11 items-center justify-center rounded-full bg-primary text-primary-content" aria-label="PingMe">
            <MessageCircle className="size-6" />
          </Link>
          <label className="input input-sm flex h-10 w-60 items-center gap-2 rounded-full border-none bg-base-300 px-4 max-md:hidden">
            <Search className="size-4 text-base-content/60" />
            <input type="search" className="grow" placeholder={language === "vi" ? "Tìm kiếm trên PingMe" : "Search PingMe"} />
          </label>
        </div>

        <div className="flex items-center justify-end gap-2">
          {authUser && (
            <button type="button" className="btn btn-circle btn-sm border-none bg-base-300" aria-label={language === "vi" ? "Thông báo" : "Notifications"}>
              <Bell className="size-5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
