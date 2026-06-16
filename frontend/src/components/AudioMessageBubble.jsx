import { Play, Volume2 } from "lucide-react";

const formatDuration = (seconds = 0) => {
  const safeSeconds = Math.max(1, Math.round(seconds || 1));
  const minutes = Math.floor(safeSeconds / 60);
  const remaining = String(safeSeconds % 60).padStart(2, "0");
  return `${minutes}:${remaining}`;
};

const AudioMessageBubble = ({ message, language }) => {
  const isVi = language === "vi";
  const attachment = message.attachment || {};

  return (
    <div className="flex w-[min(78vw,320px)] items-center gap-3 rounded-2xl bg-black/10 p-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-base-100/25">
        <Play className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center justify-between gap-2 text-xs font-semibold opacity-80">
          <span>{isVi ? "Tin nhắn thoại" : "Voice message"}</span>
          <span>{formatDuration(attachment.duration)}</span>
        </div>
        <audio controls preload="metadata" className="h-9 w-full">
          <source src={attachment.url} type={attachment.type || "audio/webm"} />
          {isVi ? "Trình duyệt không hỗ trợ phát âm thanh." : "Your browser does not support audio playback."}
        </audio>
      </div>
      <Volume2 className="size-4 shrink-0 opacity-70" />
    </div>
  );
};

export default AudioMessageBubble;
