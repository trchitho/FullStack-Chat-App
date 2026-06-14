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
  const updateNested = (section, field, value) => setDraft((current) => ({
    ...current,
    [section]: { ...(current[section] || {}), [field]: value },
  }));

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
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
            {active === "intro" && (
              <>
                <Field label="Tiểu sử" value={draft.bio} onChange={(value) => update("bio", value)} />
                <Field label="Giới thiệu" value={draft.introText} multiline onChange={(value) => update("introText", value)} />
              </>
            )}
            {active === "personal" && (
              <>
                <Field label="Thành phố hiện tại" value={draft.currentCity} onChange={(value) => update("currentCity", value)} />
                <Field label="Quê quán" value={draft.hometown} onChange={(value) => update("hometown", value)} />
                <Field label="Tình trạng quan hệ" value={draft.relationshipStatus} onChange={(value) => update("relationshipStatus", value)} />
                <Field label="Giới tính" value={draft.gender} onChange={(value) => update("gender", value)} />
              </>
            )}
            {active === "work" && (
              <>
                <Field label="Công ty" value={draft.work?.company} onChange={(value) => updateNested("work", "company", value)} />
                <Field label="Vị trí" value={draft.work?.position} onChange={(value) => updateNested("work", "position", value)} />
                <Field label="Mô tả công việc" value={draft.work?.description} multiline onChange={(value) => updateNested("work", "description", value)} />
              </>
            )}
            {active === "education" && (
              <>
                <Field label="Trường học" value={draft.education?.school} onChange={(value) => updateNested("education", "school", value)} />
                <Field label="Chuyên ngành" value={draft.education?.major} onChange={(value) => updateNested("education", "major", value)} />
                <Field label="Bằng cấp" value={draft.education?.degree} onChange={(value) => updateNested("education", "degree", value)} />
              </>
            )}
            {active === "interests" && (
              <>
                <Field label="Sở thích, phân cách bằng dấu phẩy" value={draft.hobbies?.join(", ")} onChange={(value) => update("hobbies", value.split(",").map((item) => item.trim()).filter(Boolean))} />
                <Field label="Mối quan tâm" value={draft.interests?.join(", ")} onChange={(value) => update("interests", value.split(",").map((item) => item.trim()).filter(Boolean))} />
                <Field label="Nơi đã đi qua" value={draft.placesVisited?.join(", ")} onChange={(value) => update("placesVisited", value.split(",").map((item) => item.trim()).filter(Boolean))} />
                <Field label="Điểm đến yêu thích" value={draft.favoriteDestination} onChange={(value) => update("favoriteDestination", value)} />
              </>
            )}
            {active === "links" && (
              <>
                <Field label="Website" value={draft.links?.website} onChange={(value) => updateNested("links", "website", value)} />
                <Field label="GitHub" value={draft.links?.github} onChange={(value) => updateNested("links", "github", value)} />
                <Field label="LinkedIn" value={draft.links?.linkedin} onChange={(value) => updateNested("links", "linkedin", value)} />
                <Field label="Số điện thoại" value={draft.phone} onChange={(value) => update("phone", value)} />
              </>
            )}
            {active === "details" && (
              <>
                <Field label="Tên hiển thị" value={draft.fullName} onChange={(value) => update("fullName", value)} />
                <Field label="Tên người dùng" value={draft.username} onChange={(value) => update("username", value)} />
                <Field label="Biệt danh" value={draft.nickname} onChange={(value) => update("nickname", value)} />
                <Field label="Câu nói yêu thích" value={draft.quote} onChange={(value) => update("quote", value)} />
                <Field label="Chi tiết về bạn" value={draft.aboutMe} multiline onChange={(value) => update("aboutMe", value)} />
                <Field label="Ngôn ngữ" value={draft.languages?.join(", ")} onChange={(value) => update("languages", value.split(",").map((item) => item.trim()).filter(Boolean))} />
                <Field label="Kỹ năng" value={draft.skills?.join(", ")} onChange={(value) => update("skills", value.split(",").map((item) => item.trim()).filter(Boolean))} />
              </>
            )}
          </div>
        </div>
