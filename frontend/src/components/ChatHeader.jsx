import { Info, Phone, Video, X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useLanguageStore } from "../store/useLanguageStore";
import { t } from "../lib/i18n";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const { language } = useLanguageStore();

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
              {onlineUsers.includes(selectedUser._id) ? t(language, "activeNow") : t(language, "inactive")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-primary">
          <button type="button" className="btn btn-circle btn-ghost btn-sm" title={t(language, "voiceCall")} aria-label={t(language, "voiceCall")}><Phone className="size-5" /></button>
          <button type="button" className="btn btn-circle btn-ghost btn-sm" title={t(language, "videoChat")} aria-label={t(language, "videoChat")}><Video className="size-5" /></button>
          <button type="button" className="btn btn-circle btn-ghost btn-sm" title={t(language, "chatInfo")} aria-label={t(language, "chatInfo")}><Info className="size-5" /></button>
          <button type="button" className="btn btn-circle btn-ghost btn-sm text-base-content/70" title={t(language, "closeChat")} onClick={() => setSelectedUser(null)} aria-label={t(language, "closeChat")}>
            <X className="size-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
