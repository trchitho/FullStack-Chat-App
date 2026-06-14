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
