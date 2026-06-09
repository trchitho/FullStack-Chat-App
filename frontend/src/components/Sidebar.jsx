import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  MoreHorizontal,
  Pencil,
  Search,
} from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { chatFilters, sidebarMenuItems, userCardActions } from "../constants/messengerUi";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { closeFloatingMenus, FLOATING_MENU_CLOSE_EVENT } from "../lib/menuEvents";

const Sidebar = ({ onOpenPanel = () => {} }) => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const [activeFilter, setActiveFilter] = useState("Tất cả");
  const [openUserMenu, setOpenUserMenu] = useState(null);
  const [userMenuPosition, setUserMenuPosition] = useState(null);
  const [showMainMenu, setShowMainMenu] = useState(false);
  const [mainMenuPosition, setMainMenuPosition] = useState(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    getUsers();
  }, [getUsers]);

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

    return users.filter((user) => {
      const matchesSearch = user.fullName.toLowerCase().includes(search);
      if (!matchesSearch) return false;
      if (activeFilter === "Chưa đọc") return user.unread;
      if (activeFilter === "Nhóm") return user.isGroup;
      return true;
    });
  }, [activeFilter, query, users]);

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="relative flex h-full w-[360px] max-w-full shrink-0 flex-col overflow-x-hidden border-r border-base-300 bg-base-200 max-lg:w-[92px]">
      <div className="min-w-0 space-y-4 border-b border-base-300 p-4 max-lg:px-3">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-3xl font-bold tracking-tight max-lg:hidden">Đoạn chat</h1>
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
            placeholder="Tìm kiếm người dùng"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>

        <div className="flex items-center gap-2 max-lg:hidden">
          {chatFilters.map((filter) => (
            <button
              key={filter}
              type="button"
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                activeFilter === filter ? "bg-primary/20 text-primary" : "hover:bg-base-300"
              }`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {showMainMenu && mainMenuPosition && createPortal(
        <MainSidebarMenu position={mainMenuPosition} onOpenPanel={onOpenPanel} />,
        document.body
      )}

      <div className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto p-2">
        {filteredUsers.map((user) => {
          const isOnline = onlineUsers.includes(user._id);
          const isSelected = selectedUser?._id === user._id;

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
                  <div className="truncate font-semibold">{user.fullName}</div>
                  <div className="truncate text-sm text-base-content/60">
                    {user.lastMessageText || (isOnline ? "Đang hoạt động" : "Chưa có tin nhắn")}
                  </div>
                </div>
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
                    top: Math.min(rect.bottom + 6, window.innerHeight - 346),
                    left: Math.min(rect.left - 170, window.innerWidth - 280),
                  });
                  setOpenUserMenu(shouldOpen ? user._id : null);
                }}
                aria-label={`Mở tùy chọn ${user.fullName}`}
              >
                <MoreHorizontal className="size-4" />
              </button>

              {openUserMenu === user._id && userMenuPosition && createPortal(
                <UserActionMenu position={userMenuPosition} />,
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
  );
};

const MainSidebarMenu = ({ position, onOpenPanel }) => (
  <div
    data-pingme-floating-menu
    className="fixed z-[110] w-64 rounded-xl border border-base-300 bg-base-100 p-1.5 text-sm shadow-2xl"
    style={{ top: Math.max(8, position.top), left: Math.max(8, position.left) }}
  >
    {sidebarMenuItems.map(({ id, label, icon: Icon }, index) => (
      <div key={id}>
        {(index === 1 || index === 4 || index === 5) && <div className="my-1 h-px bg-base-300" />}
        <button
          type="button"
          className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-left font-semibold hover:bg-base-300"
          onClick={() => {
            closeFloatingMenus();
            onOpenPanel(id);
          }}
        >
          <Icon className="size-4 shrink-0" />
          {label}
        </button>
      </div>
    ))}
  </div>
);

const UserActionMenu = ({ position }) => (
  <div
    data-pingme-floating-menu
    className="fixed z-[110] max-h-[calc(100dvh-16px)] w-64 overflow-y-auto rounded-xl border border-base-300 bg-base-100 p-1.5 text-sm shadow-2xl"
    style={{ top: Math.max(8, position.top), left: Math.max(8, position.left) }}
  >
    {userCardActions.map(({ label, icon: Icon }) => (
      <button key={label} type="button" className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left font-semibold hover:bg-base-300">
        <Icon className="size-4 shrink-0" />
        {label}
      </button>
    ))}
  </div>
);

export default Sidebar;
