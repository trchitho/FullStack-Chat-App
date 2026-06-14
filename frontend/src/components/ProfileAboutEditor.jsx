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
