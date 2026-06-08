import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import {
  Bell,
  Gamepad2,
  Grid3X3,
  Home,
  LogOut,
  MessageCircle,
  Search,
  Settings,
  Store,
  User,
  Users,
} from "lucide-react";

const navItems = [
  { icon: Home, label: "Trang chủ" },
  { icon: MessageCircle, label: "Đoạn chat" },
  { icon: Store, label: "Marketplace" },
  { icon: Users, label: "Nhóm" },
  { icon: Gamepad2, label: "Trò chơi" },
];

const Navbar = () => {
  const { logout, authUser } = useAuthStore();

  return (
    <header className="fixed left-0 right-0 top-0 z-40 border-b border-base-300 bg-base-100/95 backdrop-blur">
      <div className="grid h-16 grid-cols-[360px_1fr_360px] items-center px-4 max-lg:grid-cols-[1fr_auto]">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex size-11 items-center justify-center rounded-full bg-primary text-primary-content" aria-label="PingMe">
            <MessageCircle className="size-6" />
          </Link>
          <label className="input input-sm flex h-10 w-60 items-center gap-2 rounded-full border-none bg-base-300 px-4 max-md:hidden">
            <Search className="size-4 text-base-content/60" />
            <input type="search" className="grow" placeholder="Tìm kiếm trên PingMe" />
          </label>
        </div>

        <nav className="flex justify-center gap-2 max-lg:hidden">
          {navItems.map(({ icon: Icon, label }) => (
            <button key={label} type="button" className="btn btn-ghost h-12 w-24 rounded-xl text-base-content/70 hover:bg-base-300" aria-label={label}>
              <Icon className="size-6" />
            </button>
          ))}
        </nav>

        <div className="flex items-center justify-end gap-2">
          <Link to="/settings" className="btn btn-circle btn-sm border-none bg-base-300" aria-label="Cài đặt">
            <Settings className="size-5" />
          </Link>
          {authUser && (
            <>
              <button type="button" className="btn btn-circle btn-sm border-none bg-base-300" aria-label="Menu">
                <Grid3X3 className="size-5" />
              </button>
              <button type="button" className="btn btn-circle btn-sm border-none bg-base-300" aria-label="Thông báo">
                <Bell className="size-5" />
              </button>
              <Link to="/profile" className="btn btn-circle btn-sm border-none bg-base-300" aria-label="Trang cá nhân">
                {authUser.profilePic ? <img src={authUser.profilePic} alt="" className="size-8 rounded-full object-cover" /> : <User className="size-5" />}
              </Link>
              <button type="button" className="btn btn-circle btn-sm border-none bg-base-300" onClick={logout} aria-label="Đăng xuất">
                <LogOut className="size-5" />
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
