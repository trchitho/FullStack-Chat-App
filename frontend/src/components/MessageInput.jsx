import { useEffect, useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { Image, Laugh, Mic, Paperclip, Send, ThumbsUp, X } from "lucide-react";
import toast from "react-hot-toast";

const MessageInput = ({ replyTo, onCancelReply }) => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef(null);
  const attachmentInputRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const { sendMessage, uploadAttachment } = useChatStore();
  const composerEmojis = ["😀", "😆", "😍", "😂", "😢", "😡", "👍", "❤️", "🎉", "🙏"];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };
    const handleEscape = (event) => {
      if (event.key === "Escape") setShowEmojiPicker(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAttachmentChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (file.size > 100 * 1024 * 1024) {
      toast.error("File tối đa 100MB");
      event.target.value = "";
      return;
    }
    setAttachmentFile(file);
  };

  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const audioFile = new File([audioBlob], `voice-${Date.now()}.webm`, { type: "audio/webm" });
        setAttachmentFile(audioFile);
        setIsRecording(false);
        stream.getTracks().forEach((track) => track.stop());
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch (error) {
      toast.error("Không thể bật micro");
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview && !attachmentFile) return;

    try {
      const attachment = attachmentFile ? await uploadAttachment(attachmentFile) : undefined;
      await sendMessage({
        text: text.trim(),
        image: imagePreview,
        attachment,
        replyTo: replyTo && {
          messageId: replyTo.id,
          senderName: replyTo.senderName,
          preview: replyTo.preview,
        },
      });

      // Clear form
      setText("");
      setImagePreview(null);
      setAttachmentFile(null);
      onCancelReply?.();
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (attachmentInputRef.current) attachmentInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleQuickLike = async () => {
    try {
      await sendMessage({ text: "👍" });
    } catch (error) {
      console.error("Failed to send quick like:", error);
    }
  };

  return (
    <div className="relative shrink-0 border-t border-base-300 bg-base-100 px-6 py-4">
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
            />
            <button
              onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300
              flex items-center justify-center"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}

      {replyTo && (
        <div className="mb-3 flex items-center justify-between rounded-xl border-l-4 border-primary bg-base-200 px-4 py-2">
          <div className="min-w-0">
            <div className="text-sm font-bold">{replyTo.senderName}</div>
            <div className="truncate text-sm text-base-content/60">{replyTo.preview}</div>
          </div>
          <button type="button" className="btn btn-circle btn-ghost btn-xs" onClick={onCancelReply} aria-label="Hủy trả lời">
            <X className="size-4" />
          </button>
        </div>
      )}

      {attachmentFile && (
        <div className="mb-3 flex items-center justify-between gap-3 rounded-xl bg-base-200 px-4 py-2 text-sm">
          <div className="min-w-0">
            <div className="truncate font-semibold">{attachmentFile.name}</div>
            <div className="text-base-content/60">{Math.ceil(attachmentFile.size / 1024)} KB</div>
          </div>
          <button type="button" className="btn btn-circle btn-ghost btn-xs" onClick={() => setAttachmentFile(null)} aria-label="Gỡ file đính kèm">
            <X className="size-4" />
          </button>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <button
          type="button"
          className={`btn btn-circle btn-ghost btn-sm text-primary ${imagePreview ? "bg-primary/10" : ""}`}
          onClick={() => fileInputRef.current?.click()}
          title="Gửi ảnh"
          aria-label="Gửi ảnh"
        >
          <Image size={20} />
        </button>
        <button
          type="button"
          className="btn btn-circle btn-ghost btn-sm text-primary"
          onClick={() => attachmentInputRef.current?.click()}
          title="Đính kèm file"
          aria-label="Đính kèm file"
        >
          <Paperclip size={20} />
        </button>
        <button
          type="button"
          className={`btn btn-circle btn-ghost btn-sm text-primary ${isRecording ? "bg-error/15 text-error" : ""}`}
          onClick={toggleRecording}
          title={isRecording ? "Dừng ghi âm" : "Gửi tin nhắn thoại"}
          aria-label={isRecording ? "Dừng ghi âm" : "Gửi tin nhắn thoại"}
        >
          <Mic size={20} />
        </button>
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full bg-base-300 px-4">
          <input
            type="text"
            className="input input-sm h-11 min-h-11 flex-1 border-none bg-transparent focus:outline-none"
            placeholder="Aa"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />
          <input
            type="file"
            className="hidden"
            ref={attachmentInputRef}
            onChange={handleAttachmentChange}
          />

          <button
            type="button"
            className="btn btn-circle btn-ghost btn-sm text-primary"
            onClick={() => setShowEmojiPicker((value) => !value)}
            title="Mở biểu tượng cảm xúc"
            aria-label="Mở biểu tượng cảm xúc"
          >
            <Laugh size={20} />
          </button>
        </div>
        <button
          type={text.trim() || imagePreview || attachmentFile ? "submit" : "button"}
          className="btn btn-sm btn-circle btn-ghost text-primary"
          onClick={text.trim() || imagePreview || attachmentFile ? undefined : handleQuickLike}
          title={text.trim() || imagePreview || attachmentFile ? "Gửi tin nhắn" : "Gửi thích"}
          aria-label={text.trim() || imagePreview || attachmentFile ? "Gửi tin nhắn" : "Gửi thích"}
        >
          {text.trim() || imagePreview || attachmentFile ? <Send size={22} /> : <ThumbsUp size={22} />}
        </button>
      </form>
      {showEmojiPicker && (
        <div ref={emojiPickerRef} className="absolute bottom-20 right-16 z-50 grid grid-cols-5 gap-2 rounded-2xl border border-base-300 bg-base-100 p-3 shadow-2xl">
          {composerEmojis.map((emoji) => (
            <button
              key={emoji}
              type="button"
              className="rounded-lg p-2 text-xl hover:bg-base-300"
              onClick={() => {
                setText((value) => `${value}${emoji}`);
                setShowEmojiPicker(false);
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
export default MessageInput;
