import { useEffect, useRef, useState } from "react";
import { Mic, Phone, PhoneOff, Video, VideoOff } from "lucide-react";
import { useCallStore } from "../store/useCallStore";
import { useAuthStore } from "../store/useAuthStore";
import { useCallRingtone } from "../hooks/useCallRingtone";

const CallAvatar = ({ user, compact = false }) => (
  <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-zinc-900">
    <img
      src={user?.profilePic || "/avatar.png"}
      alt=""
      className={`${compact ? "size-16" : "size-28"} rounded-full object-cover`}
    />
    <span className={`${compact ? "text-sm" : "text-lg"} font-semibold`}>
      {user?.fullName || "PingMe"}
    </span>
  </div>
);

const CallWindow = () => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const {
    activeCall, localStream, remoteStream, remoteCameraOff,
    attachVideoRefs, finishCall, notifyMediaState,
  } = useCallStore();
  const authUser = useAuthStore((state) => state.authUser);
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
  useCallRingtone(
    "outgoing",
    activeCall?.direction === "outgoing" && ["calling", "ringing"].includes(activeCall?.status)
  );

  if (!activeCall) return null;
  const isVideo = activeCall.type === "video";
  const hasRemoteVideo = remoteStream?.getVideoTracks().some((track) => track.readyState === "live");
  const hasLocalVideo = localStream?.getVideoTracks().some((track) => track.readyState === "live");
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
      <section role="dialog" aria-modal="true" aria-label="Cuộc gọi PingMe" className="relative flex h-full min-h-0 max-h-[760px] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-zinc-950 shadow-2xl">
        <div className="z-20 shrink-0 flex items-center justify-between border-b border-white/10 bg-zinc-950 p-4">
          <div>
            <h2 className="text-lg font-bold">{activeCall.peer?.fullName || "Cuộc gọi PingMe"}</h2>
            <p className="text-sm text-white/65">{statusLabel}</p>
          </div>
        </div>
        <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-black">
          {isVideo ? (
            <>
              <video ref={remoteVideoRef} autoPlay playsInline className="absolute inset-0 h-full w-full object-contain" />
              {(!hasRemoteVideo || remoteCameraOff) && (
                <div className="absolute inset-0"><CallAvatar user={activeCall.peer} /></div>
              )}
            </>
          ) : (
            <>
              <audio ref={remoteVideoRef} autoPlay />
              <CallAvatar user={activeCall.peer} />
            </>
          )}
          {isVideo && (
            <div className="absolute bottom-4 right-4 z-20 aspect-video w-36 overflow-hidden rounded-2xl border border-white/20 bg-zinc-900 sm:w-44">
              <video ref={localVideoRef} autoPlay muted playsInline className="h-full w-full object-cover" />
              {(cameraOff || !hasLocalVideo) && <div className="absolute inset-0"><CallAvatar user={authUser} compact /></div>}
            </div>
          )}
        </div>
        <div className="z-30 flex shrink-0 items-center justify-center gap-4 bg-zinc-950 p-5">
          <button type="button" className={`btn btn-circle text-white ${micMuted ? "bg-error/80" : "bg-white/10 hover:bg-white/20"}`} onClick={() => { toggleTrack("audio", micMuted); setMicMuted(!micMuted); }} aria-label={micMuted ? "Bật mic" : "Tắt mic"}><Mic className="size-5" /></button>
          <button type="button" className={`btn btn-circle text-white ${cameraOff ? "bg-error/80" : "bg-white/10 hover:bg-white/20"}`} onClick={() => {
            const enabled = cameraOff;
            toggleTrack("video", enabled);
            setCameraOff(!enabled);
            notifyMediaState("video", enabled);
          }} aria-label={cameraOff ? "Bật camera" : "Tắt camera"} disabled={!isVideo}>{isVideo && !cameraOff ? <Video className="size-5" /> : <VideoOff className="size-5" />}</button>
          <button type="button" className="btn btn-circle btn-error" onClick={() => finishCall(endStatus)} aria-label="Kết thúc cuộc gọi"><PhoneOff className="size-6" /></button>
        </div>
      </section>
    </div>
  );
};

export default CallWindow;
