import { Send, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useSocialStore } from "../store/useSocialStore";

const SharePostModal = ({ post, open, onClose }) => {
  const sharePost = useSocialStore((state) => state.sharePost);
  const friends = useSocialStore((state) => state.friends);
  const getFriends = useSocialStore((state) => state.getFriends);
  const [content, setContent] = useState("");
  const [audience, setAudience] = useState("friends");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    getFriends();
    const closeOnEscape = (event) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [getFriends, onClose, open]);

  if (!open) return null;

  const submit = async () => {
    setSubmitting(true);
    try {
      await sharePost(post._id, { content, audience });
      setContent("");
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[170] flex items-center justify-center bg-black/60 p-3"
      onMouseDown={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-post-title"
        className="flex max-h-[calc(100dvh-24px)] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-base-100 shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-base-300 p-4">
          <h2 id="share-post-title" className="text-lg font-bold">Chia sẻ bài viết</h2>
          <button type="button" className="btn btn-circle btn-ghost btn-sm" onClick={onClose} aria-label="Đóng">
            <X className="size-5" />
          </button>
        </header>
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
          <textarea
            className="textarea textarea-bordered min-h-28 w-full resize-none"
            placeholder="Hãy nói gì đó về nội dung này..."
            value={content}
            onChange={(event) => setContent(event.target.value)}
            aria-label="Nội dung chia sẻ"
          />
          <label className="form-control">
            <span className="label-text mb-2 font-semibold">Đối tượng</span>
            <select
              className="select select-bordered w-full"
              value={audience}
              onChange={(event) => setAudience(event.target.value)}
            >
              <option value="public">Công khai</option>
              <option value="friends">Bạn bè</option>
              <option value="private">Chỉ mình tôi</option>
            </select>
          </label>
          <div className="rounded-xl border border-base-300 p-3">
            <div className="font-semibold">{post.author?.fullName}</div>
            <p className="mt-1 line-clamp-3 text-sm text-base-content/70">
              {post.content || "Bài viết có nội dung đa phương tiện"}
            </p>
          </div>
          <button
            type="button"
            className="btn btn-primary w-full"
            onClick={submit}
            disabled={submitting}
          >
            {submitting && <span className="loading loading-spinner loading-sm" />}
            Chia sẻ ngay
          </button>
          {!!friends.length && (
            <div>
              <h3 className="mb-2 font-bold">Gửi qua tin nhắn</h3>
              <div className="flex gap-3 overflow-x-auto pb-2">
