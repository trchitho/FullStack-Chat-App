import { useEffect, useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { Image, Laugh, Send, ThumbsUp, X } from "lucide-react";
import toast from "react-hot-toast";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const { sendMessage } = useChatStore();
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
      toast.error("Please select an image file");
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

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;

    try {
      await sendMessage({
        text: text.trim(),
        image: imagePreview,
      });

      // Clear form
      setText("");
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message:", error);
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

      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <button
          type="button"
          className={`btn btn-circle btn-ghost btn-sm text-primary ${imagePreview ? "bg-primary/10" : ""}`}
          onClick={() => fileInputRef.current?.click()}
          aria-label="Gửi ảnh"
        >
          <Image size={20} />
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

          <button
            type="button"
            className="btn btn-circle btn-ghost btn-sm text-primary"
            onClick={() => setShowEmojiPicker((value) => !value)}
            aria-label="Mở biểu tượng cảm xúc"
          >
            <Laugh size={20} />
          </button>
        </div>
        <button
          type="submit"
          className="btn btn-sm btn-circle btn-ghost text-primary"
        >
          {text.trim() || imagePreview ? <Send size={22} /> : <ThumbsUp size={22} />}
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
