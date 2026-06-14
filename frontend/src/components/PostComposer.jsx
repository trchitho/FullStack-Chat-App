import { ImagePlus, Send, Video, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useSocialStore } from "../store/useSocialStore";

const PostComposer = ({ authUser }) => {
  const createPost = useSocialStore((state) => state.createPost);
  const uploadAttachment = useChatStore((state) => state.uploadAttachment);
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [audience, setAudience] = useState("friends");
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    const closeOnEscape = (event) => event.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  const addFiles = (event) => {
    const selected = [...event.target.files].filter((file) =>
      file.type.startsWith("image/") || file.type.startsWith("video/")
    );
    setFiles((current) => [...current, ...selected].slice(0, 8));
  };

  const submit = async () => {
    if (!content.trim() && !files.length) return;
    setSubmitting(true);
    try {
      const uploaded = await Promise.all(files.map(async (file) => {
        const attachment = await uploadAttachment(file);
        return {
          url: attachment.url,
          key: attachment.key,
          type: file.type.startsWith("video/") ? "video" : "image",
          mimeType: file.type,
          size: file.size,
        };
      }));
      await createPost({ content, audience, media: uploaded });
      setContent("");
      setFiles([]);
      setOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button type="button" className="flex w-full items-center gap-3 rounded-xl border border-base-300 bg-base-100 p-4 text-left shadow-sm" onClick={() => setOpen(true)}>
        <img src={authUser.profilePic || "/avatar.png"} alt="" className="size-11 rounded-full object-cover" />
        <span className="flex-1 rounded-full bg-base-200 px-4 py-3 text-base-content/60">Bạn đang nghĩ gì?</span>
      </button>
      {open && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 sm:p-4" onMouseDown={() => setOpen(false)}>
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="post-composer-title"
            className="flex h-dvh w-full flex-col bg-base-100 sm:h-auto sm:max-h-[90dvh] sm:max-w-2xl sm:rounded-2xl"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header className="flex items-center justify-between border-b border-base-300 p-4">
              <button type="button" className="btn btn-circle btn-ghost btn-sm sm:order-2" onClick={() => setOpen(false)} aria-label="Đóng">
                <X className="size-5" />
              </button>
              <h2 id="post-composer-title" className="text-xl font-bold">Tạo bài viết</h2>
              <button type="button" className="btn btn-primary btn-sm min-h-10" onClick={submit} disabled={submitting || (!content.trim() && !files.length)}>
                <Send className="size-4" /> Đăng
              </button>
            </header>
            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              <div className="flex items-center gap-3">
                <img src={authUser.profilePic || "/avatar.png"} alt="" className="size-11 rounded-full object-cover" />
                <div>
                  <div className="font-bold">{authUser.fullName}</div>
