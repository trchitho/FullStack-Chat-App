import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";

import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";
import ChatPanel from "../components/ChatPanel";
import NewMessageComposer from "../components/NewMessageComposer";
import CallWindow from "../components/CallWindow";
import { Phone, PhoneOff, Video } from "lucide-react";
import { useCallStore } from "../store/useCallStore";
import { useCallRingtone } from "../hooks/useCallRingtone";

const HomePage = () => {
  const { selectedUser, subscribeToMessages, unsubscribeFromMessages } = useChatStore();
  const socket = useAuthStore((state) => state.socket);
  const { incomingCall, acceptIncomingCall, rejectIncomingCall, subscribeToCalls, unsubscribeFromCalls } = useCallStore();
  const [activePanel, setActivePanel] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!socket) return undefined;
    subscribeToMessages(socket);
    subscribeToCalls(socket);
    return () => {
      unsubscribeFromMessages(socket);
      unsubscribeFromCalls(socket);
    };
  }, [socket, subscribeToMessages, unsubscribeFromMessages, subscribeToCalls, unsubscribeFromCalls]);

  const openPanel = (panel) => {
    if (panel === "requests") {
      navigate("/message-requests");
      return;
    }
    setActivePanel(panel);
  };

  return (
    <main className="h-dvh max-w-full overflow-x-hidden bg-base-100 pt-16">
      <div className="relative flex h-[calc(100dvh-4rem)] min-h-0 max-w-full overflow-hidden">
        <div className={`${selectedUser ? "hidden md:flex" : "flex"} min-h-0 w-full shrink-0 md:w-auto`}>
          <Sidebar onOpenPanel={openPanel} />
        </div>

        <section className={`${selectedUser ? "flex" : "hidden md:flex"} min-w-0 flex-1 bg-base-100`}>
          {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
        </section>

        <ChatPanel
          panel={activePanel}
          onClose={() => setActivePanel(null)}
          onOpenProfile={() => navigate("/profile/me")}
        />
        <NewMessageComposer />
        {incomingCall && (
          <IncomingCallDialog
            call={incomingCall}
            onAccept={acceptIncomingCall}
            onDecline={rejectIncomingCall}
          />
        )}
        <CallWindow />
      </div>
    </main>
  );
};

const IncomingCallDialog = ({ call, onAccept, onDecline }) => {
  const isVideo = call.type === "video";
  useCallRingtone("incoming", Boolean(call.callId));

  return (
    <div className="fixed inset-0 z-[180] flex items-center justify-center bg-black/60 p-4">
      <section role="dialog" aria-modal="true" aria-label="Cuộc gọi đến" className="w-full max-w-sm rounded-3xl border border-base-300 bg-base-100 p-6 text-center shadow-2xl">
        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/20 text-primary">
          {call.caller?.profilePic ? (
            <img src={call.caller.profilePic} alt="" className="size-16 rounded-full object-cover" />
          ) : isVideo ? <Video className="size-8" /> : <Phone className="size-8" />}
        </div>
        <h2 className="text-xl font-bold">{isVideo ? "Cuộc gọi video đến" : "Cuộc gọi thoại đến"}</h2>
        <p className="mt-2 text-sm text-base-content/65">{call.caller?.fullName || "Người dùng PingMe"} đang gọi cho bạn.</p>
        <div className="mt-6 flex justify-center gap-4">
          <button type="button" className="btn btn-circle btn-error" onClick={onDecline} aria-label="Từ chối cuộc gọi">
            <PhoneOff className="size-6" />
          </button>
          <button type="button" className="btn btn-circle btn-success" onClick={onAccept} aria-label="Chấp nhận cuộc gọi">
            <Phone className="size-6" />
          </button>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
