import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useChatStore } from "../store/useChatStore";

import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";
import ChatPanel from "../components/ChatPanel";
import NewMessageComposer from "../components/NewMessageComposer";

const HomePage = () => {
  const { selectedUser, subscribeToMessages, unsubscribeFromMessages } = useChatStore();
  const [activePanel, setActivePanel] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [subscribeToMessages, unsubscribeFromMessages]);

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
      </div>
    </main>
  );
};
export default HomePage;
