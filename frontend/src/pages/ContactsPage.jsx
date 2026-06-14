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
        {!!friendRequests.incoming.length && (
          <section id="friend-requests" className="mb-5 rounded-xl border border-base-300 bg-base-100 p-4">
            <h2 className="text-xl font-bold">Lời mời kết bạn</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {friendRequests.incoming.map((request) => (
                <div key={request._id} className="flex items-center gap-3 rounded-xl bg-base-200 p-3">
                  <img src={request.requester.profilePic || "/avatar.png"} alt="" className="size-12 rounded-full object-cover" />
                  <div className="min-w-0 flex-1">
                    <Link to={`/profile/${request.requester._id}`} className="block truncate font-bold hover:underline">
                      {request.requester.fullName}
                    </Link>
                    <div className="mt-2 flex gap-2">
                      <button type="button" className="btn btn-primary btn-sm" onClick={() => respondToFriendRequest(request._id, "accept")}>Chấp nhận</button>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => respondToFriendRequest(request._id, "decline")}>Xóa</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
        <section className="overflow-hidden rounded-xl border border-base-300 bg-base-100">
          <div className="border-b border-base-300 p-4">
            <h2 className="text-xl font-bold">Tất cả bạn bè</h2>
          </div>
          <div className="divide-y divide-base-300">
            {filtered.map((friend) => (
              <div key={friend._id} className="flex min-w-0 items-center gap-3 p-4 hover:bg-base-200">
                <Link to={`/profile/${friend._id}`} className="shrink-0">
                  <img src={friend.profilePic || "/avatar.png"} alt="" className="size-14 rounded-full object-cover" />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link to={`/profile/${friend._id}`} className="block truncate font-bold hover:underline">{friend.fullName}</Link>
                  <p className="truncate text-sm text-base-content/55">{friend.bio || `@${friend.username || "pingme"}`}</p>
                </div>
                <button type="button" className="btn btn-circle btn-ghost min-h-11 min-w-11" onClick={() => openChat(friend)} aria-label={`Nhắn tin cho ${friend.fullName}`}>
                  <MessageCircle className="size-5" />
                </button>
              </div>
            ))}
            {!filtered.length && <div className="p-10 text-center text-base-content/55">Không tìm thấy bạn bè.</div>}
          </div>
        </section>
      </div>
    </main>
  );
};

export default ContactsPage;
