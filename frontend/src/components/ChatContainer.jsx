import { useEffect, useRef } from 'react'
import { useChatStore } from '../store/useChatStore';
import ChatHeader from './ChatHeader';
import MessageInput from './MessageInput';
import MessageSkeleton from './skeletons/MessageSkeleton';
import { useAuthStore } from '../store/useAuthStore';
import { formatMessageTime } from '../lib/utils';

const ChatContainer = () => {
  const {messages, getMessages , isMessagesLoading, selectedUser, subscribeToMessages, unsubscribeFromMessages} = useChatStore();

  const {authUser} = useAuthStore();
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    getMessages(selectedUser._id)

    subscribeToMessages();

    return () => unsubscribeFromMessages();
  },[selectedUser._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) container.scrollTop = container.scrollHeight;
  }, [messages]);

  if(isMessagesLoading) { 
    return (
      <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
        <ChatHeader />
        <MessageSkeleton /> 
        <MessageInput />
      </div>
    )
  }
  

  
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-base-100">
      <ChatHeader />

      <div ref={messagesContainerRef} className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-8 py-5">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center text-base-content/70">
            <img src={selectedUser.profilePic || "/avatar.png"} alt="" className="mb-4 size-20 rounded-full object-cover" />
            <h2 className="text-xl font-bold text-base-content">{selectedUser.fullName}</h2>
            <p className="mt-2 max-w-md text-sm">Hãy bắt đầu cuộc trò chuyện. Tin nhắn mới sẽ hiển thị tại đây.</p>
          </div>
        ) : messages.map((message) => (
          <div
            key={message._id}
            className={`chat min-w-0 ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
          >
            <div className=" chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={
                    message.senderId === authUser._id
                      ? authUser.profilePic || "/avatar.png"
                      : selectedUser.profilePic || "/avatar.png"
                  }
                  alt="profile pic"
                />
              </div>
            </div>
            <div className="chat-header mb-1 px-1">
              <time className="text-xs text-base-content/50">
                {formatMessageTime(message.createdAt)}
              </time>
            </div>
            <div className={`chat-bubble flex max-w-[min(68%,720px)] min-w-0 flex-col break-words rounded-3xl px-4 py-2 text-base ${
              message.senderId === authUser._id ? "bg-primary text-primary-content" : "bg-base-300 text-base-content"
            }`}>
              {message.image && (
                <img
                  src={message.image}
                  alt="Attachment"
                  className="mb-2 max-h-[360px] w-full max-w-[min(420px,72vw)] rounded-2xl object-contain"
                />
              )}
              {message.text && <p>{message.text}</p>}
            </div>
          </div>
        ))}
      </div>

      <MessageInput />
    </div>
  )
}

export default ChatContainer
