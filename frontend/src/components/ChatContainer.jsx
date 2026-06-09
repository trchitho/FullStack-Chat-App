import { useEffect, useRef, useState } from 'react'
import { useChatStore } from '../store/useChatStore';
import ChatHeader from './ChatHeader';
import MessageInput from './MessageInput';
import MessageSkeleton from './skeletons/MessageSkeleton';
import { useAuthStore } from '../store/useAuthStore';
import { formatMessageTime } from '../lib/utils';
import { FileText, Forward, MoreHorizontal, PhoneCall, Pin, Reply, SmilePlus, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { closeFloatingMenus, FLOATING_MENU_CLOSE_EVENT } from '../lib/menuEvents';
import { useLanguageStore } from '../store/useLanguageStore';

const ChatContainer = () => {
  const {messages, getMessages , isMessagesLoading, selectedUser, subscribeToMessages, unsubscribeFromMessages} = useChatStore();

  const {authUser} = useAuthStore();
  const { language } = useLanguageStore();
  const isVi = language === "vi";
  const messagesContainerRef = useRef(null);
  const [reactionPickerFor, setReactionPickerFor] = useState(null);
  const [messageReactions, setMessageReactions] = useState({});
  const [replyTo, setReplyTo] = useState(null);
  const [actionMenuFor, setActionMenuFor] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [hiddenMessageIds, setHiddenMessageIds] = useState([]);
  const [revokedMessageIds, setRevokedMessageIds] = useState([]);
  const [pinnedMessage, setPinnedMessage] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);
  const reactionEmojis = ["❤️", "😂", "😮", "😢", "😡", "👍"];
  const getMessagePreview = (message) => {
    if (message.text) return message.text;
    if (message.call) return isVi ? "[Cuộc gọi]" : "[Call]";
    if (message.image || message.attachment?.type?.startsWith("image/")) return isVi ? "[Hình ảnh]" : "[Image]";
    if (message.attachment?.type?.startsWith("audio/")) return isVi ? "[Tin nhắn thoại]" : "[Voice message]";
    if (message.attachment) return isVi ? "[Tệp đính kèm]" : "[Attachment]";
    return isVi ? "[Tin nhắn]" : "[Message]";
  };

  useEffect(() => {
    getMessages(selectedUser._id)

    subscribeToMessages();

    return () => unsubscribeFromMessages();
  },[selectedUser._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) container.scrollTop = container.scrollHeight;
  }, [messages]);

  useEffect(() => {
    const closeLightbox = (event) => {
      if (event.key === "Escape") setLightboxImage(null);
    };
    document.addEventListener("keydown", closeLightbox);
    return () => document.removeEventListener("keydown", closeLightbox);
  }, []);

  useEffect(() => {
    const closeMenus = () => {
      setActionMenuFor(null);
      setReactionPickerFor(null);
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") closeMenus();
    };
    const closeOnOutsideClick = (event) => {
      if (!event.target.closest("[data-pingme-floating-menu], [data-pingme-menu-trigger]")) closeMenus();
    };
    window.addEventListener(FLOATING_MENU_CLOSE_EVENT, closeMenus);
    document.addEventListener("keydown", closeOnEscape);
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => {
      window.removeEventListener(FLOATING_MENU_CLOSE_EVENT, closeMenus);
      document.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("mousedown", closeOnOutsideClick);
    };
  }, []);

  useEffect(() => {
    if (!confirmAction) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setConfirmAction(null);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [confirmAction]);

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

      <div ref={messagesContainerRef} className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-2 py-3 sm:px-4 md:px-6 lg:px-8 lg:py-5">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center text-base-content/70">
            <img src={selectedUser.profilePic || "/avatar.png"} alt="" className="mb-4 size-20 rounded-full object-cover" />
            <h2 className="text-xl font-bold text-base-content">{selectedUser.fullName}</h2>
            <p className="mt-2 max-w-md text-sm">{isVi ? "Hãy bắt đầu cuộc trò chuyện. Tin nhắn mới sẽ hiển thị tại đây." : "Start the conversation. New messages will appear here."}</p>
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
              <div className={`chat-bubble relative flex max-w-[78vw] min-w-0 flex-col break-words rounded-3xl px-3 py-2 text-sm sm:px-4 sm:text-base md:max-w-[min(68%,720px)] ${
                isOwnMessage ? "bg-primary text-primary-content" : "bg-base-300 text-base-content"
              }`}>
              {isRevoked ? (
                <p className="italic opacity-70">{isOwnMessage ? (isVi ? "Bạn đã thu hồi một tin nhắn" : "You recalled a message") : (isVi ? "Tin nhắn đã được thu hồi" : "This message was recalled")}</p>
              ) : message.replyTo?.preview && (
                <div className="mb-2 rounded-2xl bg-black/10 px-3 py-2 text-sm">
                  <div className="font-bold">{message.replyTo.senderName}</div>
                  <div className="line-clamp-1 opacity-80">{message.replyTo.preview}</div>
                </div>
              )}
              {!isRevoked && message.image && (
                <button
                  type="button"
                  className="mb-2 block max-w-[78vw] rounded-2xl text-left md:max-w-[420px]"
                  onClick={() => setLightboxImage(message.image)}
                  aria-label={isVi ? "Mở ảnh toàn màn hình" : "Open image full screen"}
                >
                  <img
                    src={message.image}
                    alt={isVi ? "Ảnh đính kèm" : "Attachment"}
                    className="max-h-[360px] w-full cursor-zoom-in rounded-2xl object-contain"
                  />
                </button>
              )}
              {!isRevoked && message.attachment?.url && (
                message.attachment.type?.startsWith("image/") ? (
                  <button
                    type="button"
                    className="mb-2 block max-w-[78vw] rounded-2xl text-left md:max-w-[420px]"
                    onClick={() => setLightboxImage(message.attachment.url)}
                    aria-label={isVi ? "Mở ảnh toàn màn hình" : "Open image full screen"}
                  >
                    <img
                      src={message.attachment.url}
                      alt={message.attachment.name || (isVi ? "Tệp ảnh" : "Image file")}
                      className="max-h-[360px] w-full cursor-zoom-in rounded-2xl object-contain"
                    />
                  </button>
                ) : message.attachment.type?.startsWith("audio/") ? (
                  <audio controls className="w-full max-w-[78vw] md:max-w-xs">
                    <source src={message.attachment.url} type={message.attachment.type} />
                    {isVi ? "Trình duyệt không hỗ trợ phát âm thanh." : "Your browser does not support audio playback."}
                  </audio>
                ) : (
                  <a
                    href={message.attachment.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex max-w-xs items-center gap-3 rounded-2xl bg-black/10 px-3 py-2 hover:bg-black/15"
                  >
                    <FileText className="size-5 shrink-0" />
                    <span className="min-w-0 truncate">{message.attachment.name || (isVi ? "Tệp đính kèm" : "Attachment")}</span>
                  </a>
                )
              )}
              {!isRevoked && message.call && (
                <div className="flex min-w-48 items-start gap-3 rounded-2xl bg-black/10 p-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-base-100/25">
                    <PhoneCall className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold">{message.call.type === "video" ? (isVi ? "Cuộc gọi video" : "Video call") : (isVi ? "Cuộc gọi thoại" : "Voice call")}</div>
                    <div className="text-sm opacity-80">{Math.max(1, Math.round((message.call.duration || 1) / 60))} {isVi ? "phút" : "min"}</div>
                    <button type="button" className="mt-2 w-full rounded-lg bg-base-100/25 px-3 py-1.5 font-semibold hover:bg-base-100/35">
                      {isVi ? "Gọi lại" : "Call back"}
                    </button>
                  </div>
                </div>
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
                  data-pingme-menu-trigger
                  className="btn btn-circle btn-ghost btn-xs"
                  title={isVi ? "Bày tỏ cảm xúc bằng biểu tượng cảm xúc" : "React with an emoji"}
                  aria-label={isVi ? "Bày tỏ cảm xúc bằng biểu tượng cảm xúc" : "React with an emoji"}
                  onClick={() => {
                    const shouldOpen = reactionPickerFor !== message._id;
                    closeFloatingMenus();
                    setReactionPickerFor(shouldOpen ? message._id : null);
                  }}
                >
                  <SmilePlus className="size-4" />
                </button>
                <button
                  type="button"
                  data-pingme-menu-trigger
                  className="btn btn-circle btn-ghost btn-xs"
                  title={isVi ? "Trả lời tin nhắn này" : "Reply to this message"}
                  aria-label={isVi ? "Trả lời tin nhắn này" : "Reply to this message"}
                  onClick={() => {
                    closeFloatingMenus();
                    setReplyTo({
                      id: message._id,
                      senderName: isOwnMessage ? authUser.fullName : selectedUser.fullName,
                      preview: getMessagePreview(message),
                    });
                  }}
                >
                  <Reply className="size-4" />
                </button>
                <button
                  type="button"
                  data-pingme-menu-trigger
                  className="btn btn-circle btn-ghost btn-xs"
                  title={isVi ? "Hành động khác" : "More actions"}
                  aria-label={isVi ? "Hành động khác" : "More actions"}
                  onClick={() => {
                    const shouldOpen = actionMenuFor !== message._id;
                    closeFloatingMenus();
                    setActionMenuFor(shouldOpen ? message._id : null);
                  }}
                >
                  <MoreHorizontal className="size-4" />
                </button>
              </div>
              {reactionPickerFor === message._id && (
                <div data-pingme-floating-menu role="menu" className="absolute z-40 mt-[-44px] flex rounded-full bg-base-100 p-1 shadow-2xl">
                  {reactionEmojis.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      role="menuitem"
                      className="rounded-full p-1.5 text-xl hover:bg-base-300"
                      aria-label={`${isVi ? "Thả cảm xúc" : "React"} ${emoji}`}
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
                <div data-pingme-floating-menu role="menu" className="absolute z-40 mt-8 w-56 rounded-xl border border-base-300 bg-base-100 p-2 shadow-2xl">
                  <button
                    type="button"
                    role="menuitem"
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left font-semibold hover:bg-base-300"
                    onClick={() => {
                      setConfirmAction({ messageId: message._id, isOwnMessage });
                      setActionMenuFor(null);
                    }}
                  >
                    <Trash2 className="size-4" />
                    {isOwnMessage ? (isVi ? "Thu hồi" : "Recall") : (isVi ? "Gỡ" : "Remove")}
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left font-semibold hover:bg-base-300"
                    onClick={() => {
                      toast(isVi ? "Tính năng chuyển tiếp sẽ được bổ sung" : "Forwarding will be added soon");
                      setActionMenuFor(null);
                    }}
                  >
                    <Forward className="size-4" />
                    {isVi ? "Chuyển tiếp" : "Forward"}
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left font-semibold hover:bg-base-300"
                  onClick={() => {
                      setPinnedMessage({ id: message._id, preview: getMessagePreview(message) });
                      setActionMenuFor(null);
                    }}
                  >
                    <Pin className="size-4" />
                    {isVi ? "Ghim" : "Pin"}
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
          <div
            role="dialog"
            aria-modal="true"
            aria-label={confirmAction.isOwnMessage ? (isVi ? "Thu hồi tin nhắn" : "Recall message") : (isVi ? "Gỡ tin nhắn" : "Remove message")}
            className="w-full max-w-lg rounded-2xl bg-base-100 p-6 shadow-2xl"
          >
            <h2 className="text-2xl font-bold">
              {confirmAction.isOwnMessage ? (isVi ? "Thu hồi tin nhắn này?" : "Recall this message?") : (isVi ? "Gỡ đối với bạn" : "Remove for you")}
            </h2>
            <p className="mt-3 text-base-content/70">
              {confirmAction.isOwnMessage
                ? (isVi ? "Tin nhắn này sẽ bị thu hồi khỏi đoạn chat. Những người khác có thể đã xem hoặc chuyển tiếp tin nhắn đó." : "This message will be recalled from the chat. Others may have already seen or forwarded it.")
                : (isVi ? "Tin nhắn này sẽ bị gỡ khỏi thiết bị của bạn, nhưng vẫn hiển thị với các thành viên khác trong đoạn chat." : "This message will be removed from your device, but it may still appear for other chat members.")}
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" className="btn btn-ghost" onClick={() => setConfirmAction(null)}>{isVi ? "Hủy" : "Cancel"}</button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  if (confirmAction.isOwnMessage) setRevokedMessageIds((ids) => [...ids, confirmAction.messageId]);
                  else setHiddenMessageIds((ids) => [...ids, confirmAction.messageId]);
                  setConfirmAction(null);
                }}
              >
                {confirmAction.isOwnMessage ? (isVi ? "Thu hồi" : "Recall") : (isVi ? "Gỡ" : "Remove")}
              </button>
            </div>
          </div>
        </div>
      )}
      {lightboxImage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={isVi ? "Xem ảnh toàn màn hình" : "Full screen image viewer"}
          className="fixed inset-0 z-[130] flex items-center justify-center bg-black/85 p-4"
          onClick={() => setLightboxImage(null)}
        >
          <button type="button" className="absolute right-5 top-5 rounded-full bg-white/10 p-3 text-white hover:bg-white/20" onClick={() => setLightboxImage(null)} aria-label={isVi ? "Đóng ảnh" : "Close image"}>
            <X className="size-6" />
          </button>
          <img src={lightboxImage} alt={isVi ? "Ảnh toàn màn hình" : "Attachment full screen"} className="max-h-[88vh] max-w-[92vw] object-contain" onClick={(event) => event.stopPropagation()} />
        </div>
      )}
    </div>
  )
}

export default ChatContainer
