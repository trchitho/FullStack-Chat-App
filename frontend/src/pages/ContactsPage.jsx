import { MessageCircle, Search, UserCheck, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useChatStore } from "../store/useChatStore";
import { useSocialStore } from "../store/useSocialStore";

const ContactsPage = () => {
  const navigate = useNavigate();
  const { setSelectedUser } = useChatStore();
  const {
    friends, friendRequests, getFriends, getFriendRequests, respondToFriendRequest,
  } = useSocialStore();
  const [query, setQuery] = useState("");

  useEffect(() => {
    getFriends();
    getFriendRequests();
  }, [getFriendRequests, getFriends]);

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();
    return friends.filter((friend) =>
      !search || `${friend.fullName} ${friend.username || ""}`.toLowerCase().includes(search)
    );
  }, [friends, query]);

  const openChat = (friend) => {
    setSelectedUser(friend);
    navigate("/");
  };

  return (
    <main className="min-h-dvh overflow-x-hidden bg-base-200 px-3 pb-10 pt-20 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <header className="mb-5">
          <h1 className="text-3xl font-bold">Danh bạ</h1>
          <p className="mt-1 text-base-content/60">Bạn bè và lời mời kết bạn trên PingMe</p>
          <label className="input input-bordered mt-4 flex h-12 w-full items-center gap-3 rounded-full bg-base-100">
            <Search className="size-5 text-base-content/55" />
            <input type="search" className="min-w-0 grow" placeholder="Tìm kiếm bạn bè" value={query} onChange={(event) => setQuery(event.target.value)} />
          </label>
        </header>
        <div className="mb-5 grid grid-cols-2 gap-3">
          <a href="#friend-requests" className="flex min-h-24 items-center gap-3 rounded-xl border border-base-300 bg-base-100 p-4">
            <UserCheck className="size-8 text-primary" />
            <span><strong className="block">Lời mời kết bạn</strong>{friendRequests.incoming.length} đang chờ</span>
          </a>
          <div className="flex min-h-24 items-center gap-3 rounded-xl border border-base-300 bg-base-100 p-4">
            <Users className="size-8 text-secondary" />
            <span><strong className="block">Bạn bè</strong>{friends.length} người</span>
          </div>
        </div>
