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
  const messageEndRef = useRef(null);

  useEffect(() => {
    getMessages(selectedUser._id)

    subscribeToMessages();

    return () => unsubscribeFromMessages();
  },[selectedUser._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

  if(isMessagesLoading) { 
    return (
      <div className='flex-1 flex flex-col overflow-auto'>
        <ChatHeader />
        <MessageSkeleton /> 
        <MessageInput />
      </div>
    )
  }
  

  
  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-base-100">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto px-8 py-5 space-y-3">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
            ref={messageEndRef}
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
            <div className={`chat-bubble flex max-w-[68%] flex-col rounded-3xl px-4 py-2 text-base ${
              message.senderId === authUser._id ? "bg-primary text-primary-content" : "bg-base-300 text-base-content"
            }`}>
              {message.image && (
                <img
                  src={message.image}
                  alt="Attachment"
                  className="sm:max-w-[200px] rounded-md mb-2"
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
