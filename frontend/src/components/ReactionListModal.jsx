import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";

const filters = [
  ["all", "Tất cả"],
  ["like", "👍"],
  ["love", "❤️"],
  ["haha", "😂"],
  ["wow", "😮"],
  ["sad", "😢"],
  ["angry", "😡"],
];

const ReactionListModal = ({ open, reactions, onClose }) => {
  const [filter, setFilter] = useState("all");
  const visible = useMemo(
    () => reactions.filter((reaction) => filter === "all" || reaction.type === filter),
    [filter, reactions]
  );

  useEffect(() => {
    if (!open) return undefined;
    const closeOnEscape = (event) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[175] flex items-center justify-center bg-black/60 p-3" onMouseDown={onClose}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="reaction-list-title"
        className="flex max-h-[calc(100dvh-24px)] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-base-100 shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="flex shrink-0 items-center justify-between border-b border-base-300 p-4">
          <h2 id="reaction-list-title" className="text-lg font-bold">Lượt bày tỏ cảm xúc</h2>
          <button type="button" className="btn btn-circle btn-ghost btn-sm" onClick={onClose} aria-label="Đóng">
            <X className="size-5" />
          </button>
        </header>
        <div className="flex shrink-0 gap-1 overflow-x-auto border-b border-base-300 p-2">
          {filters.map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={`btn btn-sm shrink-0 ${filter === id ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setFilter(id)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-2">
          {visible.map((reaction) => (
            <div key={`${reaction.user?._id}-${reaction.type}`} className="flex items-center gap-3 rounded-xl p-3 hover:bg-base-200">
              <img src={reaction.user?.profilePic || "/avatar.png"} alt="" className="size-11 rounded-full object-cover" />
              <span className="min-w-0 flex-1 truncate font-semibold">
                {reaction.user?.fullName || "Người dùng PingMe"}
              </span>
              <span className="text-xl">
                {filters.find(([id]) => id === reaction.type)?.[1]}
              </span>
            </div>
          ))}
          {visible.length === 0 && (
            <p className="p-8 text-center text-sm text-base-content/60">
              Chưa có lượt bày tỏ cảm xúc phù hợp.
            </p>
          )}
        </div>
      </section>
    </div>
  );
};

export default ReactionListModal;
