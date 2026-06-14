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
