import { ImagePlus, Send, Video, X } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
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
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể đăng bài viết");
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
                  <select className="select select-bordered select-xs" value={audience} onChange={(event) => setAudience(event.target.value)} aria-label="Đối tượng xem bài viết">
                    <option value="friends">Bạn bè</option>
                    <option value="public">Công khai</option>
                    <option value="private">Chỉ mình tôi</option>
                  </select>
                </div>
              </div>
              <textarea
                autoFocus
                className="textarea mt-4 min-h-44 w-full resize-none border-none bg-transparent text-xl focus:outline-none"
                placeholder="Bạn đang nghĩ gì?"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                maxLength={10000}
              />
              <div className="flex flex-wrap gap-2 border-y border-base-300 py-3">
                <label className="btn btn-ghost min-h-11 cursor-pointer">
                  <ImagePlus className="size-5 text-success" /> Ảnh
                  <input type="file" accept="image/*" multiple className="sr-only" onChange={addFiles} />
                </label>
                <label className="btn btn-ghost min-h-11 cursor-pointer">
                  <Video className="size-5 text-secondary" /> Video
                  <input type="file" accept="video/*" multiple className="sr-only" onChange={addFiles} />
                </label>
              </div>
              {!!files.length && (
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {files.map((file, index) => (
                    <div key={`${file.name}-${index}`} className="relative overflow-hidden rounded-xl bg-base-200">
                      {file.type.startsWith("video/") ? (
                        <video src={URL.createObjectURL(file)} className="aspect-square h-full w-full object-cover" muted />
                      ) : (
                        <img src={URL.createObjectURL(file)} alt={file.name} className="aspect-square h-full w-full object-cover" />
                      )}
                      <button
                        type="button"
                        className="btn btn-circle btn-sm absolute right-2 top-2"
                        onClick={() => setFiles((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                        aria-label={`Xóa ${file.name}`}
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </>
  );
};

export default PostComposer;
