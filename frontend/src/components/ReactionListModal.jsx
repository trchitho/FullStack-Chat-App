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
