import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useChatStore } from "../store/useChatStore";

import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";
import ChatPanel from "../components/ChatPanel";

const HomePage = () => {
  const { selectedUser } = useChatStore();
  const [activePanel, setActivePanel] = useState(null);
  const navigate = useNavigate();

  return (
    <main className="h-screen bg-base-100 pt-16">
      <div className="relative flex h-[calc(100vh-4rem)] overflow-hidden">
        <Sidebar onOpenPanel={setActivePanel} />

        <section className="min-w-0 flex-1 bg-base-100">
          {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
        </section>

        <ChatPanel
          panel={activePanel}
          onClose={() => setActivePanel(null)}
          onOpenProfile={() => navigate("/profile")}
        />
      </div>
    </main>
  );
};
export default HomePage;
