import { useEffect, useState } from "react";
import { X } from "lucide-react";

const categories = [
  ["intro", "Giới thiệu"],
  ["personal", "Thông tin cá nhân"],
  ["work", "Công việc"],
  ["education", "Trình độ học vấn"],
  ["interests", "Sở thích và mối quan tâm"],
  ["links", "Liên kết và liên hệ"],
  ["details", "Chi tiết về bạn"],
];

const Field = ({ label, value, onChange, multiline = false }) => (
  <label className="form-control gap-2">
    <span className="font-semibold">{label}</span>
    {multiline ? (
      <textarea className="textarea textarea-bordered min-h-28" value={value || ""} onChange={(event) => onChange(event.target.value)} />
    ) : (
      <input className="input input-bordered" value={value || ""} onChange={(event) => onChange(event.target.value)} />
    )}
  </label>
);

const ProfileAboutEditor = ({ profile, open, onClose, onSave }) => {
  const [active, setActive] = useState("intro");
  const [draft, setDraft] = useState(profile);

  useEffect(() => setDraft(profile), [profile]);
  useEffect(() => {
    if (!open) return undefined;
    const closeOnEscape = (event) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [onClose, open]);

  if (!open) return null;
  const update = (field, value) => setDraft((current) => ({ ...current, [field]: value }));

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 p-3" onMouseDown={onClose}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-editor-title"
        className="flex max-h-[calc(100dvh-24px)] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-base-100 shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-base-300 p-4">
          <h2 id="profile-editor-title" className="text-xl font-bold">Chỉnh sửa thông tin cá nhân</h2>
          <button type="button" className="btn btn-circle btn-ghost btn-sm" onClick={onClose} aria-label="Đóng">
            <X className="size-5" />
          </button>
        </header>
        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
          <nav className="flex shrink-0 gap-1 overflow-x-auto border-b border-base-300 p-3 md:w-60 md:flex-col md:border-b-0 md:border-r">
            {categories.map(([id, label]) => (
              <button key={id} type="button" className={`btn justify-start whitespace-nowrap ${active === id ? "btn-primary" : "btn-ghost"}`} onClick={() => setActive(id)}>
                {label}
              </button>
            ))}
          </nav>
