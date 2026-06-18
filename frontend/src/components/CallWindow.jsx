import { useEffect, useRef, useState } from "react";
import { Mic, Phone, PhoneOff, Video, VideoOff } from "lucide-react";
import { useCallStore } from "../store/useCallStore";

const CallWindow = () => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const { activeCall, localStream, attachVideoRefs, finishCall } = useCallStore();
  const [elapsed, setElapsed] = useState(0);
  const [micMuted, setMicMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);

  useEffect(() => {
    attachVideoRefs(localVideoRef, remoteVideoRef);
  }, [attachVideoRefs, activeCall?.callId]);

  useEffect(() => {
    setMicMuted(false);
    setCameraOff(false);
  }, [activeCall?.callId]);

  useEffect(() => {
    if (!activeCall?.connectedAt) {
      setElapsed(0);
      return undefined;
    }
    const updateElapsed = () =>
      setElapsed(Math.max(0, Math.floor((Date.now() - activeCall.connectedAt) / 1000)));
    updateElapsed();
    const intervalId = window.setInterval(updateElapsed, 1000);
    return () => window.clearInterval(intervalId);
  }, [activeCall?.connectedAt]);

  if (!activeCall) return null;
  const isVideo = activeCall.type === "video";
  const endStatus = activeCall.status === "connected" ? "completed" : "cancelled";
  const durationLabel = `${Math.floor(elapsed / 60)}:${String(elapsed % 60).padStart(2, "0")}`;
  const statusLabel = activeCall.status === "connected"
    ? `Đang trong cuộc gọi · ${durationLabel}`
    : activeCall.status === "ringing"
      ? "Đang đổ chuông..."
      : "Đang kết nối...";
  const toggleTrack = (kind, enabled) => {
    localStream?.getTracks()
      .filter((track) => track.kind === kind)
      .forEach((track) => {
        track.enabled = enabled;
      });
  };

  return (
    <div className="fixed inset-0 z-[190] flex items-center justify-center bg-black/85 p-4 text-white">
      <section role="dialog" aria-modal="true" aria-label="Cuộc gọi PingMe" className="relative flex h-full max-h-[760px] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-zinc-950 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 p-4">
          <div>
            <h2 className="text-lg font-bold">{activeCall.peer?.fullName || "Cuộc gọi PingMe"}</h2>
            <p className="text-sm text-white/65">{statusLabel}</p>
          </div>
        </div>
        <div className="relative flex flex-1 items-center justify-center bg-black">
          {isVideo ? (
            <video ref={remoteVideoRef} autoPlay playsInline className="h-full w-full object-contain" />
          ) : (
            <>
              <audio ref={remoteVideoRef} autoPlay />
              <Phone className="size-24 text-white/35" />
            </>
          )}
          {isVideo && <video ref={localVideoRef} autoPlay muted playsInline className="absolute bottom-5 right-5 aspect-video w-44 rounded-2xl border border-white/20 bg-black object-cover" />}
        </div>
        <div className="flex items-center justify-center gap-4 p-5">
          <button type="button" className={`btn btn-circle text-white ${micMuted ? "bg-error/80" : "bg-white/10 hover:bg-white/20"}`} onClick={() => { toggleTrack("audio", micMuted); setMicMuted(!micMuted); }} aria-label={micMuted ? "Bật mic" : "Tắt mic"}><Mic className="size-5" /></button>
          <button type="button" className={`btn btn-circle text-white ${cameraOff ? "bg-error/80" : "bg-white/10 hover:bg-white/20"}`} onClick={() => { toggleTrack("video", cameraOff); setCameraOff(!cameraOff); }} aria-label={cameraOff ? "Bật camera" : "Tắt camera"} disabled={!isVideo}>{isVideo && !cameraOff ? <Video className="size-5" /> : <VideoOff className="size-5" />}</button>
          <button type="button" className="btn btn-circle btn-error" onClick={() => finishCall(endStatus)} aria-label="Kết thúc cuộc gọi"><PhoneOff className="size-6" /></button>
        </div>
      </section>
    </div>
  );
};

export default CallWindow;
