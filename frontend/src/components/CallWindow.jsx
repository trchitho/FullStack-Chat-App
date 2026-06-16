import { useEffect, useRef } from "react";
import { Mic, Phone, PhoneOff, Video, VideoOff } from "lucide-react";
import { useCallStore } from "../store/useCallStore";

const CallWindow = () => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const { activeCall, attachVideoRefs, finishCall } = useCallStore();

  useEffect(() => {
    attachVideoRefs(localVideoRef, remoteVideoRef);
  }, [attachVideoRefs, activeCall?.callId]);

  if (!activeCall) return null;
  const isVideo = activeCall.type === "video";

  return (
    <div className="fixed inset-0 z-[190] flex items-center justify-center bg-black/85 p-4 text-white">
      <section role="dialog" aria-modal="true" aria-label="Cuộc gọi PingMe" className="relative flex h-full max-h-[760px] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-zinc-950 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 p-4">
          <div>
            <h2 className="text-lg font-bold">{activeCall.peer?.fullName || "Cuộc gọi PingMe"}</h2>
            <p className="text-sm text-white/65">{activeCall.status === "connected" ? "Đang trong cuộc gọi" : "Đang kết nối..."}</p>
          </div>
        </div>
        <div className="relative flex flex-1 items-center justify-center bg-black">
          {isVideo ? <video ref={remoteVideoRef} autoPlay playsInline className="h-full w-full object-contain" /> : <Phone className="size-24 text-white/35" />}
          {isVideo && <video ref={localVideoRef} autoPlay muted playsInline className="absolute bottom-5 right-5 aspect-video w-44 rounded-2xl border border-white/20 bg-black object-cover" />}
        </div>
        <div className="flex items-center justify-center gap-4 p-5">
          <button type="button" className="btn btn-circle bg-white/10 text-white hover:bg-white/20" aria-label="Tắt mic"><Mic className="size-5" /></button>
          <button type="button" className="btn btn-circle bg-white/10 text-white hover:bg-white/20" aria-label="Tắt camera" disabled={!isVideo}>{isVideo ? <Video className="size-5" /> : <VideoOff className="size-5" />}</button>
          <button type="button" className="btn btn-circle btn-error" onClick={() => finishCall("completed")} aria-label="Kết thúc cuộc gọi"><PhoneOff className="size-6" /></button>
        </div>
      </section>
    </div>
  );
};

export default CallWindow;
