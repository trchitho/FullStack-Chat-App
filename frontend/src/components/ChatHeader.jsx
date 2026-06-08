import { Info, Phone, Video, X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();

  return (
    <div className="border-b border-base-300 bg-base-100 px-5 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="avatar">
            <div className="size-11 rounded-full relative">
              <img src={selectedUser.profilePic || "/avatar.png"} alt={selectedUser.fullName} />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold">{selectedUser.fullName}</h3>
            <p className="text-sm text-base-content/70">
              {onlineUsers.includes(selectedUser._id) ? "Đang hoạt động" : "Không hoạt động"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-primary">
          <button type="button" className="btn btn-circle btn-ghost btn-sm" aria-label="Gọi thoại"><Phone className="size-5" /></button>
          <button type="button" className="btn btn-circle btn-ghost btn-sm" aria-label="Video trò chuyện"><Video className="size-5" /></button>
          <button type="button" className="btn btn-circle btn-ghost btn-sm" aria-label="Thông tin đoạn chat"><Info className="size-5" /></button>
          <button type="button" className="btn btn-circle btn-ghost btn-sm text-base-content/70" onClick={() => setSelectedUser(null)} aria-label="Đóng đoạn chat">
            <X className="size-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
