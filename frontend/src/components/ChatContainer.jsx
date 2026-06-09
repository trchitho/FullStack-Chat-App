import { useEffect, useRef, useState } from 'react'
import { useChatStore } from '../store/useChatStore';
import ChatHeader from './ChatHeader';
import MessageInput from './MessageInput';
import MessageSkeleton from './skeletons/MessageSkeleton';
import { useAuthStore } from '../store/useAuthStore';
import { formatMessageTime } from '../lib/utils';
import { Forward, MoreHorizontal, Pin, Reply, SmilePlus, Trash2 } from 'lucide-react';

const ChatContainer = () => {
  const {messages, getMessages , isMessagesLoading, selectedUser, subscribeToMessages, unsubscribeFromMessages} = useChatStore();

  const {authUser} = useAuthStore();
  const messagesContainerRef = useRef(null);
  const [reactionPickerFor, setReactionPickerFor] = useState(null);
  const [messageReactions, setMessageReactions] = useState({});
  const [replyTo, setReplyTo] = useState(null);
  const [actionMenuFor, setActionMenuFor] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [hiddenMessageIds, setHiddenMessageIds] = useState([]);
  const [revokedMessageIds, setRevokedMessageIds] = useState([]);
  const [pinnedMessage, setPinnedMessage] = useState(null);
  const reactionEmojis = ["❤️", "😂", "😮", "😢", "😡", "👍"];

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
      {pinnedMessage && (
        <div className="shrink-0 border-b border-base-300 bg-base-200 px-6 py-3">
          <div className="flex items-center justify-between gap-3 rounded-xl bg-base-100 px-4 py-2">
            <div className="min-w-0">
              <div className="text-sm font-bold">Đã ghim</div>
              <div className="truncate text-sm text-base-content/70">{pinnedMessage.preview}</div>
            </div>
            <button type="button" className="btn btn-ghost btn-xs" onClick={() => setPinnedMessage(null)}>Bỏ ghim</button>
          </div>
        </div>
      )}

      <div ref={messagesContainerRef} className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-8 py-5">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center text-base-content/70">
            <img src={selectedUser.profilePic || "/avatar.png"} alt="" className="mb-4 size-20 rounded-full object-cover" />
            <h2 className="text-xl font-bold text-base-content">{selectedUser.fullName}</h2>
            <p className="mt-2 max-w-md text-sm">Hãy bắt đầu cuộc trò chuyện. Tin nhắn mới sẽ hiển thị tại đây.</p>
          </div>
        ) : messages.filter((message) => !hiddenMessageIds.includes(message._id)).map((message) => {
          const isOwnMessage = message.senderId === authUser._id;
          const isRevoked = revokedMessageIds.includes(message._id);

          return (
          <div
            key={message._id}
            className={`chat group relative min-w-0 ${isOwnMessage ? "chat-end" : "chat-start"}`}
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
            <div className={`flex items-center gap-2 ${isOwnMessage ? "flex-row-reverse" : ""}`}>
              <div className={`chat-bubble relative flex max-w-[min(68%,720px)] min-w-0 flex-col break-words rounded-3xl px-4 py-2 text-base ${
                isOwnMessage ? "bg-primary text-primary-content" : "bg-base-300 text-base-content"
              }`}>
              {isRevoked ? (
                <p className="italic opacity-70">{isOwnMessage ? "Bạn đã thu hồi một tin nhắn" : "Tin nhắn đã được thu hồi"}</p>
              ) : message.replyTo?.preview && (
                <div className="mb-2 rounded-2xl bg-black/10 px-3 py-2 text-sm">
                  <div className="font-bold">{message.replyTo.senderName}</div>
                  <div className="line-clamp-1 opacity-80">{message.replyTo.preview}</div>
                </div>
              )}
              {!isRevoked && message.image && (
                <img
                  src={message.image}
                  alt="Attachment"
                  className="mb-2 max-h-[360px] w-full max-w-[min(420px,72vw)] rounded-2xl object-contain"
                />
              )}
              {!isRevoked && message.text && <p>{message.text}</p>}
              {messageReactions[message._id] && (
                <span className="absolute -bottom-4 right-3 rounded-full bg-base-100 px-1.5 py-0.5 text-sm shadow">
                  {messageReactions[message._id]}
                </span>
              )}
              </div>
              <div className="flex opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
                <button
                  type="button"
                  className="btn btn-circle btn-ghost btn-xs"
                  title="Bày tỏ cảm xúc bằng biểu tượng cảm xúc"
                  onClick={() => setReactionPickerFor(reactionPickerFor === message._id ? null : message._id)}
                >
                  <SmilePlus className="size-4" />
                </button>
                <button
                  type="button"
                  className="btn btn-circle btn-ghost btn-xs"
                  title="Trả lời tin nhắn này"
                  onClick={() => setReplyTo({
                    id: message._id,
                    senderName: isOwnMessage ? authUser.fullName : selectedUser.fullName,
                    preview: message.text || "[Hình ảnh]",
                  })}
                >
                  <Reply className="size-4" />
                </button>
                <button
                  type="button"
                  className="btn btn-circle btn-ghost btn-xs"
                  title="Hành động khác"
                  onClick={() => setActionMenuFor(actionMenuFor === message._id ? null : message._id)}
                >
                  <MoreHorizontal className="size-4" />
                </button>
              </div>
              {reactionPickerFor === message._id && (
                <div className="absolute z-40 mt-[-44px] flex rounded-full bg-base-100 p-1 shadow-2xl">
                  {reactionEmojis.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      className="rounded-full p-1.5 text-xl hover:bg-base-300"
                      onClick={() => {
                        setMessageReactions((current) => ({ ...current, [message._id]: emoji }));
                        setReactionPickerFor(null);
                      }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
              {actionMenuFor === message._id && (
                <div className="absolute z-40 mt-8 w-56 rounded-xl border border-base-300 bg-base-100 p-2 shadow-2xl">
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left font-semibold hover:bg-base-300"
                    onClick={() => {
                      setConfirmAction({ messageId: message._id, isOwnMessage });
                      setActionMenuFor(null);
                    }}
                  >
                    <Trash2 className="size-4" />
                    {isOwnMessage ? "Thu hồi" : "Gỡ"}
                  </button>
                  <button type="button" className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left font-semibold hover:bg-base-300">
                    <Forward className="size-4" />
                    Chuyển tiếp
                  </button>
                  <button type="button" className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left font-semibold hover:bg-base-300">
                    <Pin className="size-4" />
                    Ghim
                  </button>
                </div>
              )}
            </div>
          </div>
          );
        })}
      </div>

      <MessageInput replyTo={replyTo} onCancelReply={() => setReplyTo(null)} />
      {confirmAction && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-base-100 p-6 shadow-2xl">
            <h2 className="text-2xl font-bold">
              {confirmAction.isOwnMessage ? "Thu hồi tin nhắn này?" : "Gỡ đối với bạn"}
            </h2>
            <p className="mt-3 text-base-content/70">
              {confirmAction.isOwnMessage
                ? "Tin nhắn này sẽ bị thu hồi khỏi đoạn chat. Những người khác có thể đã xem hoặc chuyển tiếp tin nhắn đó."
                : "Tin nhắn này sẽ bị gỡ khỏi thiết bị của bạn, nhưng vẫn hiển thị với các thành viên khác trong đoạn chat."}
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" className="btn btn-ghost" onClick={() => setConfirmAction(null)}>Hủy</button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  if (confirmAction.isOwnMessage) setRevokedMessageIds((ids) => [...ids, confirmAction.messageId]);
                  else setHiddenMessageIds((ids) => [...ids, confirmAction.messageId]);
                  setConfirmAction(null);
                }}
              >
                {confirmAction.isOwnMessage ? "Thu hồi" : "Gỡ"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ChatContainer
