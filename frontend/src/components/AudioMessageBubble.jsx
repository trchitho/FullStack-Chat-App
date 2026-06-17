import { Pause, Play, Volume2 } from "lucide-react";
import { useRef, useState } from "react";

const formatDuration = (seconds = 0) => {
  const safeSeconds = Math.max(1, Math.round(seconds || 1));
  const minutes = Math.floor(safeSeconds / 60);
  const remaining = String(safeSeconds % 60).padStart(2, "0");
  return `${minutes}:${remaining}`;
};

const AudioMessageBubble = ({ message, language }) => {
  const isVi = language === "vi";
  const attachment = message.attachment || {};
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(attachment.duration || 1);
  const waveform = [30, 52, 76, 44, 88, 58, 36, 70, 92, 48, 64, 84, 42, 74, 54, 90, 38, 68];
  const progress = duration ? currentTime / duration : 0;

  const togglePlayback = async () => {
    if (!audioRef.current || !attachment.url) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }
    await audioRef.current.play();
    setIsPlaying(true);
  };

  return (
    <div className="flex w-[min(78vw,320px)] items-center gap-3 rounded-2xl bg-base-100/20 p-3">
      <button type="button" className="flex size-10 shrink-0 items-center justify-center rounded-full bg-base-100/30" onClick={togglePlayback} aria-label={isPlaying ? (isVi ? "Tạm dừng tin nhắn thoại" : "Pause voice message") : (isVi ? "Phát tin nhắn thoại" : "Play voice message")}>
        {isPlaying ? <Pause className="size-5" /> : <Play className="size-5 translate-x-0.5" />}
      </button>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex h-10 items-center gap-1">
          {waveform.map((height, index) => (
            <span
              key={`${height}-${index}`}
              className={`w-1 rounded-full bg-current transition-opacity ${index / waveform.length <= progress ? "opacity-100" : "opacity-40"}`}
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
        <div className="flex items-center justify-between gap-2 text-xs font-semibold opacity-80">
          <span>{isVi ? "Tin nhắn thoại" : "Voice message"}</span>
          <span>{formatDuration(duration)}</span>
        </div>
        <audio
          ref={audioRef}
          src={attachment.url}
          preload="metadata"
          onLoadedMetadata={() => setDuration(audioRef.current?.duration || attachment.duration || 1)}
          onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
          onEnded={() => setIsPlaying(false)}
        />
      </div>
      <Volume2 className="size-4 shrink-0 opacity-70" />
    </div>
  );
};

export default AudioMessageBubble;
