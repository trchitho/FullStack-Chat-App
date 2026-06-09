import {
  Archive,
  BellOff,
  CircleHelp,
  Flag,
  MailOpen,
  MessageCircleMore,
  Phone,
  ShieldCheck,
  Shield,
  UserCircle,
  Video,
  VolumeX,
} from "lucide-react";

export const chatFilters = ["Tất cả", "Chưa đọc", "Nhóm"];

export const sidebarMenuItems = [
  { id: "settings", label: "Tùy chọn", icon: Shield },
  { id: "requests", label: "Tin nhắn đang chờ", icon: MessageCircleMore },
  { id: "archived", label: "Đoạn chat đã lưu trữ", icon: Archive },
  { id: "restricted", label: "Tài khoản đã hạn chế", icon: VolumeX },
  { id: "privacy", label: "Quyền riêng tư và an toàn", icon: ShieldCheck },
  { id: "help", label: "Trợ giúp", icon: CircleHelp },
];

export const userCardActions = [
  { label: "Đánh dấu là chưa đọc", icon: MailOpen },
  { label: "Tắt thông báo", icon: BellOff },
  { label: "Xem trang cá nhân", icon: UserCircle },
  { label: "Gọi thoại", icon: Phone },
  { label: "Chat video", icon: Video },
  { label: "Chặn", icon: Shield },
  { label: "Lưu trữ đoạn chat", icon: Archive },
  { label: "Xóa đoạn chat", icon: VolumeX },
  { label: "Báo cáo", icon: Flag },
];
