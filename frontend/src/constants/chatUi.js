import {
  Archive,
  Bell,
  BellOff,
  CircleHelp,
  Flag,
  Mail,
  MailOpen,
  MessageCircleMore,
  Phone,
  ShieldCheck,
  Shield,
  UserCircle,
  Video,
  VolumeX,
} from "lucide-react";

export const chatFilters = [
  { id: "all", labelKey: "all" },
  { id: "unread", labelKey: "unread" },
  { id: "groups", labelKey: "groups" },
];

export const sidebarMenuItems = [
  { id: "settings", labelKey: "options", icon: Shield },
  { id: "requests", labelKey: "requests", icon: MessageCircleMore },
  { id: "archived", labelKey: "archived", icon: Archive },
  { id: "restricted", labelKey: "restricted", icon: VolumeX },
  { id: "privacy", labelKey: "privacy", icon: ShieldCheck },
  { id: "help", labelKey: "help", icon: CircleHelp },
];

export const userCardActions = [
  { labelKey: "markUnread", icon: MailOpen, activeIcon: Mail },
  { labelKey: "mute", icon: BellOff, activeIcon: Bell },
  { labelKey: "viewProfile", icon: UserCircle },
  { labelKey: "voiceCall", icon: Phone },
  { labelKey: "videoChat", icon: Video },
  { labelKey: "block", icon: Shield },
  { labelKey: "archiveChat", icon: Archive },
  { labelKey: "deleteChat", icon: VolumeX },
  { labelKey: "report", icon: Flag },
];
