import { useChatStore } from "../store/useChatStore";

import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";

const HomePage = () => {
  const { selectedUser } = useChatStore();

  return (
    <main className="h-screen bg-base-100 pt-16">
      <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
        <Sidebar />

        <section className="min-w-0 flex-1 bg-base-100">
          {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
        </section>
      </div>
    </main>
  );
};
export default HomePage;
