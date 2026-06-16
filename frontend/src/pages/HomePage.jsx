import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";

import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";
import ChatPanel from "../components/ChatPanel";
import NewMessageComposer from "../components/NewMessageComposer";
import { Phone, PhoneOff, Video } from "lucide-react";

const HomePage = () => {
  const { selectedUser, subscribeToMessages, unsubscribeFromMessages } = useChatStore();
  const socket = useAuthStore((state) => state.socket);
  const incomingCall = useAuthStore((state) => state.incomingCall);
  const answerIncomingCall = useAuthStore((state) => state.answerIncomingCall);
  const [activePanel, setActivePanel] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!socket) return undefined;
    subscribeToMessages(socket);
    return () => unsubscribeFromMessages(socket);
  }, [socket, subscribeToMessages, unsubscribeFromMessages]);

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
            onAccept={() => answerIncomingCall(true)}
            onDecline={() => answerIncomingCall(false)}
          />
        )}
      </div>
    </main>
  );
};

const IncomingCallDialog = ({ call, onAccept, onDecline }) => {
  const isVideo = call.type === "video";
  return (
    <div className="fixed inset-0 z-[180] flex items-center justify-center bg-black/60 p-4">
      <section role="dialog" aria-modal="true" aria-label="Cuộc gọi đến" className="w-full max-w-sm rounded-3xl border border-base-300 bg-base-100 p-6 text-center shadow-2xl">
        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/20 text-primary">
          {isVideo ? <Video className="size-8" /> : <Phone className="size-8" />}
        </div>
        <h2 className="text-xl font-bold">{isVideo ? "Cuộc gọi video đến" : "Cuộc gọi thoại đến"}</h2>
        <p className="mt-2 text-sm text-base-content/65">Bạn có một cuộc gọi mới trong PingMe.</p>
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
