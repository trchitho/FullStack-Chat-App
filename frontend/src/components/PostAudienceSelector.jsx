import { Globe2, Lock, Users, X } from "lucide-react";
import { useEffect } from "react";

const options = [
  {
    id: "public",
    label: "Công khai",
    description: "Mọi người trên PingMe đều có thể xem.",
    icon: Globe2,
  },
  {
    id: "friends",
    label: "Bạn bè",
    description: "Chỉ những người đã kết bạn với bạn.",
    icon: Users,
  },
  {
    id: "private",
    label: "Chỉ mình tôi",
    description: "Chỉ bạn có thể xem bài viết này.",
    icon: Lock,
  },
];

const PostAudienceSelector = ({ open, value, onChange, onClose }) => {
  useEffect(() => {
    if (!open) return undefined;
    const closeOnEscape = (event) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [onClose, open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[170] flex items-center justify-center bg-black/60 p-3" onMouseDown={onClose}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="audience-title"
        className="max-h-[calc(100dvh-24px)] w-full max-w-lg overflow-y-auto rounded-2xl border border-base-300 bg-base-100 p-4 shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-base-300 pb-3">
          <h2 id="audience-title" className="text-xl font-bold">Chọn đối tượng</h2>
          <button type="button" className="btn btn-circle btn-ghost btn-sm" onClick={onClose} aria-label="Đóng">
            <X className="size-5" />
          </button>
        </header>
        <p className="py-3 text-sm text-base-content/65">Ai có thể xem bài viết của bạn?</p>
        <div className="space-y-2">
          {options.map(({ id, label, description, icon: Icon }) => (
            <button
              key={id}
              type="button"
              className={`flex min-h-16 w-full items-center gap-3 rounded-xl p-3 text-left hover:bg-base-200 ${value === id ? "bg-primary/10" : ""}`}
              onClick={() => {
                onChange(id);
                onClose();
              }}
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-base-300">
                <Icon className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-bold">{label}</span>
                <span className="block text-sm text-base-content/60">{description}</span>
              </span>
              <input
                type="radio"
                className="radio radio-primary"
                checked={value === id}
                readOnly
                tabIndex={-1}
              />
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};

export default PostAudienceSelector;
