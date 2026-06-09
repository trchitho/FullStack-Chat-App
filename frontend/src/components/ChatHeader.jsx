import { ArrowLeft, Info, Phone, Video, X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useLanguageStore } from "../store/useLanguageStore";
import { t } from "../lib/i18n";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const { language } = useLanguageStore();

  return (
    <div className="shrink-0 border-b border-base-300 bg-base-100 px-2 py-2 sm:px-5 sm:py-3">
      <div className="flex min-w-0 items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <button type="button" className="btn btn-circle btn-ghost btn-sm md:hidden" onClick={() => setSelectedUser(null)} aria-label={language === "vi" ? "Quay lại" : "Back"}>
            <ArrowLeft className="size-5" />
          </button>
          <div className="avatar">
            <div className="relative size-10 rounded-full sm:size-11">
              <img src={selectedUser.profilePic || "/avatar.png"} alt={selectedUser.fullName} />
            </div>
          </div>

          <div className="min-w-0">
            <h3 className="truncate text-base font-bold sm:text-lg">{selectedUser.fullName}</h3>
            <p className="text-sm text-base-content/70">
              {onlineUsers.includes(selectedUser._id) ? t(language, "activeNow") : t(language, "inactive")}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-0.5 text-primary sm:gap-1">
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
