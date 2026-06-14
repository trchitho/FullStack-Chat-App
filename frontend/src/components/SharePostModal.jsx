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
