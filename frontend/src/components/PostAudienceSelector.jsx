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
