import { useEffect, useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { Image, Laugh, Mic, Paperclip, Send, ThumbsUp, X } from "lucide-react";
import toast from "react-hot-toast";
import { useLanguageStore } from "../store/useLanguageStore";

const MessageInput = ({ replyTo, onCancelReply }) => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordedDuration, setRecordedDuration] = useState(0);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef(null);
  const attachmentInputRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const cancelRecordingRef = useRef(false);
  const recordingSecondsRef = useRef(0);
  const { sendMessage, uploadAttachment } = useChatStore();
  const { language } = useLanguageStore();
  const isVi = language === "vi";
  const composerEmojis = ["😀", "😆", "😍", "😂", "😢", "😡", "👍", "❤️", "🎉", "🙏"];
  const formattedRecordingTime = `${Math.floor(recordingSeconds / 60)}:${String(recordingSeconds % 60).padStart(2, "0")}`;
  const getSupportedAudioType = () => {
    const types = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus"];
    return types.find((type) => MediaRecorder.isTypeSupported(type)) || "";
  };

  const removeAttachment = () => {
    setAttachmentFile(null);
    if (attachmentInputRef.current) attachmentInputRef.current.value = "";
  };

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

  useEffect(() => {
    if (!attachmentFile?.type.startsWith("audio/")) {
      setAudioPreviewUrl("");
      return undefined;
    }
    const url = URL.createObjectURL(attachmentFile);
    setAudioPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [attachmentFile]);

  useEffect(() => {
    if (!isRecording) {
      setRecordingSeconds(0);
      recordingSecondsRef.current = 0;
      return undefined;
    }
    const intervalId = window.setInterval(() => setRecordingSeconds((value) => {
      recordingSecondsRef.current = value + 1;
      return value + 1;
    }), 1000);
    return () => window.clearInterval(intervalId);
  }, [isRecording]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast.error(isVi ? "Vui lòng chọn file ảnh" : "Please select an image file");
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
      toast.error(isVi ? "File tối đa 100MB" : "Maximum file size is 100MB");
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
      const audioType = getSupportedAudioType();
      const recorder = new MediaRecorder(stream, audioType ? { mimeType: audioType } : undefined);
      audioChunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        if (cancelRecordingRef.current) {
          cancelRecordingRef.current = false;
          audioChunksRef.current = [];
          setIsRecording(false);
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        const mimeType = recorder.mimeType || "audio/webm";
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        if (!audioBlob.size) {
          toast.error(isVi ? "Bản ghi âm trống" : "The recording is empty");
          setIsRecording(false);
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        const extension = mimeType.includes("ogg") ? "ogg" : "webm";
        const audioFile = new File([audioBlob], `voice-${Date.now()}.${extension}`, { type: mimeType });
        setRecordedDuration(recordingSecondsRef.current);
        setAttachmentFile(audioFile);
        setIsRecording(false);
        stream.getTracks().forEach((track) => track.stop());
      };
      mediaRecorderRef.current = recorder;
      cancelRecordingRef.current = false;
      recorder.start();
      setIsRecording(true);
    } catch (error) {
      toast.error(isVi ? "Không thể bật micro" : "Could not start microphone");
    }
  };

  const cancelRecording = () => {
    cancelRecordingRef.current = true;
    audioChunksRef.current = [];
    if (mediaRecorderRef.current?.state === "recording") mediaRecorderRef.current.stop();
    setIsRecording(false);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview && !attachmentFile) return;

    try {
      setIsSending(true);
      const uploadedAttachment = attachmentFile ? await uploadAttachment(attachmentFile) : undefined;
      const attachment = uploadedAttachment
        ? { ...uploadedAttachment, duration: attachmentFile.type.startsWith("audio/") ? recordedDuration : undefined }
        : undefined;
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
      setRecordedDuration(0);
      onCancelReply?.();
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (attachmentInputRef.current) attachmentInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error(isVi ? "Không gửi được tin nhắn" : "Could not send message");
    } finally {
      setIsSending(false);
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
    <div className="relative shrink-0 border-t border-base-300 bg-base-100 px-2 py-2 sm:px-4 lg:px-6 lg:py-4">
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
          <button type="button" className="btn btn-circle btn-ghost btn-xs" onClick={onCancelReply} aria-label={isVi ? "Hủy trả lời" : "Cancel reply"}>
            <X className="size-4" />
          </button>
        </div>
      )}

      {attachmentFile && (
        <div className="mb-3 flex items-center gap-3 rounded-2xl bg-base-300 p-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-base-100">
            <Paperclip className="size-5 text-primary" />
          </div>
          <div className="relative max-w-40 rounded-xl bg-base-100 px-3 py-2 pr-8 text-sm font-semibold">
            <div className="truncate">{attachmentFile.name}</div>
            <button type="button" className="absolute -right-2 -top-2 btn btn-circle btn-xs" onClick={removeAttachment} aria-label={isVi ? "Gỡ file đính kèm" : "Remove attachment"}>
              <X className="size-3" />
            </button>
          </div>
          {audioPreviewUrl && (
            <audio controls src={audioPreviewUrl} className="h-10 min-w-0 flex-1">
              {isVi ? "Trình duyệt không hỗ trợ âm thanh." : "Audio playback is not supported."}
            </audio>
          )}
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-center gap-1.5 sm:gap-2">
        {isRecording ? (
          <div className="flex min-w-0 flex-1 items-center gap-3 rounded-full bg-blue-600 px-3 py-2 text-white">
            <button type="button" className="btn btn-circle btn-xs border-none bg-blue-700 text-white" onClick={cancelRecording} aria-label={isVi ? "Hủy ghi âm" : "Cancel recording"}>
              <X className="size-4" />
            </button>
            <button type="button" className="btn btn-circle btn-sm border-none bg-white text-blue-600" onClick={toggleRecording} aria-label={isVi ? "Dừng ghi âm" : "Stop recording"}>
              <span className="size-3 rounded-sm bg-blue-600" />
            </button>
            <div className="h-1 flex-1 rounded-full bg-white/40">
              <div className="h-full w-1/2 rounded-full bg-white" />
            </div>
            <span className="rounded-full bg-white px-2 py-0.5 text-sm font-bold text-blue-600">{formattedRecordingTime}</span>
          </div>
        ) : (
          <>
        <button
          type="button"
          className={`btn btn-circle btn-ghost btn-sm text-primary ${imagePreview ? "bg-primary/10" : ""}`}
          disabled={isSending}
          onClick={() => fileInputRef.current?.click()}
          title={isVi ? "Gửi ảnh" : "Send image"}
          aria-label={isVi ? "Gửi ảnh" : "Send image"}
        >
          <Image size={20} />
        </button>
        <button
          type="button"
          className="btn btn-circle btn-ghost btn-sm text-primary"
          disabled={isSending}
          onClick={() => attachmentInputRef.current?.click()}
          title={isVi ? "Đính kèm file" : "Attach file"}
          aria-label={isVi ? "Đính kèm file" : "Attach file"}
        >
          <Paperclip size={20} />
        </button>
        <button
          type="button"
          className={`btn btn-circle btn-ghost btn-sm text-primary ${isRecording ? "bg-error/15 text-error" : ""}`}
          disabled={isSending}
          onClick={toggleRecording}
          title={isRecording ? (isVi ? "Dừng ghi âm" : "Stop recording") : (isVi ? "Gửi tin nhắn thoại" : "Send voice message")}
          aria-label={isRecording ? (isVi ? "Dừng ghi âm" : "Stop recording") : (isVi ? "Gửi tin nhắn thoại" : "Send voice message")}
        >
          <Mic size={20} />
        </button>
          </>
        )}
        {!isRecording && (
          <>
        <div className="flex min-w-0 flex-1 items-center gap-1 rounded-full bg-base-300 px-3 sm:gap-2 sm:px-4">
          <input
            type="text"
          className="input input-sm h-10 min-h-10 flex-1 border-none bg-transparent sm:h-11 sm:min-h-11"
            disabled={isSending}
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
            title={isVi ? "Mở biểu tượng cảm xúc" : "Open emoji picker"}
            aria-label={isVi ? "Mở biểu tượng cảm xúc" : "Open emoji picker"}
          >
            <Laugh size={20} />
          </button>
        </div>
        <button
          type={text.trim() || imagePreview || attachmentFile ? "submit" : "button"}
          className="btn btn-sm btn-circle btn-ghost text-primary"
          disabled={isSending}
          onClick={text.trim() || imagePreview || attachmentFile ? undefined : handleQuickLike}
          title={text.trim() || imagePreview || attachmentFile ? (isVi ? "Gửi tin nhắn" : "Send message") : (isVi ? "Gửi thích" : "Send like")}
          aria-label={text.trim() || imagePreview || attachmentFile ? (isVi ? "Gửi tin nhắn" : "Send message") : (isVi ? "Gửi thích" : "Send like")}
        >
          {isSending ? <span className="loading loading-spinner loading-xs" /> : text.trim() || imagePreview || attachmentFile ? <Send size={22} /> : <ThumbsUp size={22} />}
        </button>
          </>
        )}
      </form>
      {showEmojiPicker && (
        <div ref={emojiPickerRef} className="absolute bottom-14 right-2 z-50 grid grid-cols-5 gap-2 rounded-2xl border border-base-300 bg-base-100 p-3 shadow-2xl sm:bottom-20 sm:right-16">
          {composerEmojis.map((emoji) => (
            <button
              key={emoji}
              type="button"
              className="rounded-lg p-2 text-xl hover:bg-base-300"
              aria-label={`${isVi ? "Chèn biểu tượng" : "Insert emoji"} ${emoji}`}
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
