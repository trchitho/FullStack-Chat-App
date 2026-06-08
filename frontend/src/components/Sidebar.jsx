import { useEffect, useMemo, useState } from "react";
import {
  MoreHorizontal,
  Pencil,
  Search,
} from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { chatFilters, sidebarMenuItems, userCardActions } from "../constants/messengerUi";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";

const Sidebar = ({ onOpenPanel = () => {} }) => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const [activeFilter, setActiveFilter] = useState("Tất cả");
  const [openUserMenu, setOpenUserMenu] = useState(null);
  const [showMainMenu, setShowMainMenu] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    getUsers();
  }, [getUsers]);

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
    <aside className="relative flex h-full w-[360px] shrink-0 flex-col border-r border-base-300 bg-base-200 max-lg:w-[92px]">
      <div className="space-y-4 border-b border-base-300 p-4 max-lg:px-3">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-3xl font-bold tracking-tight max-lg:hidden">Đoạn chat</h1>
          <div className="flex gap-2">
            <button
              type="button"
              className="btn btn-circle btn-sm border-none bg-base-300"
              onClick={() => setShowMainMenu((value) => !value)}
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
            placeholder="Tìm kiếm trên Messenger"
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

      {showMainMenu && (
        <div className="absolute left-72 top-16 z-30 w-80 rounded-xl border border-base-300 bg-base-100 p-2 shadow-2xl max-lg:left-4">
          {sidebarMenuItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left font-semibold hover:bg-base-300"
              onClick={() => {
                setShowMainMenu(false);
                onOpenPanel(id);
              }}
            >
              <Icon className="size-5" />
              {label}
            </button>
          ))}
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {filteredUsers.map((user) => {
          const isOnline = onlineUsers.includes(user._id);
          const isSelected = selectedUser?._id === user._id;

          return (
            <div key={user._id} className="group relative">
              <button
                type="button"
                onClick={() => setSelectedUser(user)}
                className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition ${
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
                    {isOnline ? "Đang hoạt động" : "Tin nhắn và cuộc gọi gần đây"}
                  </div>
                </div>
              </button>

              <button
                type="button"
                className="absolute right-3 top-5 hidden rounded-full bg-base-300 p-2 shadow group-hover:block max-lg:hidden"
                onClick={() => setOpenUserMenu(openUserMenu === user._id ? null : user._id)}
                aria-label={`Mở tùy chọn ${user.fullName}`}
              >
                <MoreHorizontal className="size-4" />
              </button>

              {openUserMenu === user._id && (
                <div className="absolute left-32 top-12 z-20 w-80 rounded-xl border border-base-300 bg-base-100 p-2 shadow-2xl">
                  {userCardActions.map(({ label, icon: Icon }) => (
                    <button key={label} type="button" className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left font-semibold hover:bg-base-300">
                      <Icon className="size-5" />
                      {label}
                    </button>
                  ))}
                </div>
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

export default Sidebar;
