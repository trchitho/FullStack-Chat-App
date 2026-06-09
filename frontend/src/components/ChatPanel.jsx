import {
  ArrowLeft,
  Bell,
  ChevronRight,
  Moon,
  Search,
  Shield,
  UserCircle,
  Volume2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useThemeStore } from "../store/useThemeStore";
import { useLanguageStore } from "../store/useLanguageStore";
import { t } from "../lib/i18n";
import { useChatStore } from "../store/useChatStore";

const samplePeople = ["Nguyễn Thắng", "Trần Đình Huy Hoàng", "Son Ngoc Pham", "Bách Ngô"];
const sidebarActionStorageKey = "pingme-sidebar-user-actions";
const snoozeOptions = ["Trong 15 phút", "Trong 1 giờ", "Trong 8 giờ", "Trong 24 giờ", "Đến khi tắt"];
const snoozeDurations = {
  "Trong 15 phút": 15 * 60 * 1000,
  "Trong 1 giờ": 60 * 60 * 1000,
  "Trong 8 giờ": 8 * 60 * 60 * 1000,
  "Trong 24 giờ": 24 * 60 * 60 * 1000,
};

const panelCopy = {
  vi: {
    account: "Tài khoản",
    viewOwnProfile: "Xem trang cá nhân của bạn",
    activeStatus: "Trạng thái hoạt động",
    activeOn: "ĐANG BẬT",
    activeOff: "ĐANG TẮT",
    notifications: "Thông báo",
    sound: "Âm thanh thông báo",
    soundDesc: "Dùng thông báo bằng âm thanh để biết về tin nhắn, cuộc gọi đến, đoạn chat video và âm thanh trong ứng dụng.",
    dnd: "Không làm phiền",
    dndDesc: "Tắt thông báo trong một khoảng thời gian cụ thể.",
    darkMode: "Chế độ tối",
    darkDesc: "Điều chỉnh giao diện của PingMe để giảm độ chói và cho đôi mắt được nghỉ ngơi.",
    off: "Tắt",
    on: "Bật",
    auto: "Tự động",
    payments: "Quản lý khoản thanh toán",
    messagingActivity: "Quản lý hoạt động gửi tin nhắn",
    blocking: "Quản lý phần Chặn",
    snoozeTitle: "Tắt thông báo",
    snoozeBody: "Cửa sổ chat vẫn đóng và bạn sẽ không nhận được thông báo đẩy trên thiết bị.",
    cancel: "Hủy",
    next: "Tiếp",
  },
  en: {
    account: "Account",
    viewOwnProfile: "View your profile",
    activeStatus: "Active status",
    activeOn: "ON",
    activeOff: "OFF",
    notifications: "Notifications",
    sound: "Notification sounds",
    soundDesc: "Use sounds for messages, calls, video chats, and in-app audio.",
    dnd: "Do not disturb",
    dndDesc: "Mute notifications for a specific period.",
    darkMode: "Dark mode",
    darkDesc: "Adjust PingMe appearance to reduce glare and rest your eyes.",
    off: "Off",
    on: "On",
    auto: "Automatic",
    payments: "Manage payments",
    messagingActivity: "Manage messaging activity",
    blocking: "Manage blocking",
    snoozeTitle: "Mute notifications",
    snoozeBody: "Chat windows stay closed and you will not receive push notifications on this device.",
    cancel: "Cancel",
    next: "Next",
  },
};

const pc = (language, key) => panelCopy[language]?.[key] || panelCopy.vi[key] || key;

const PanelShell = ({ title, children, onClose, onBack }) => (
  <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
    <section className="max-h-[90dvh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-base-300 bg-base-200 p-4 shadow-2xl">
      <div className="mb-4 flex items-center gap-3">
        <button type="button" className="btn btn-circle btn-sm border-none bg-base-300" onClick={onBack || onClose}>
          {onBack ? <ArrowLeft className="size-5" /> : <X className="size-5" />}
        </button>
        <h2 className="text-2xl font-bold">{title}</h2>
      </div>
      {children}
    </section>
  </div>
);

const AccountPreview = ({ authUser, onOpenProfile, language }) => (
  <button type="button" className="flex w-full items-center gap-3 rounded-xl p-3 text-left hover:bg-base-300" onClick={onOpenProfile}>
    <img src={authUser?.profilePic || "/avatar.png"} alt={authUser?.fullName} className="size-12 rounded-full object-cover" />
    <div>
      <div className="font-bold">{authUser?.fullName || pc(language, "account")}</div>
      <div className="text-sm text-base-content/60">{pc(language, "viewOwnProfile")}</div>
    </div>
  </button>
);

const ToggleRow = ({ icon: Icon, title, description, checked, onChange }) => (
  <div className="flex items-center gap-3 rounded-xl p-3">
    <Icon className="size-5 shrink-0" />
    <div className="min-w-0 flex-1">
      <div className="font-bold">{title}</div>
      {description && <p className="text-sm text-base-content/60">{description}</p>}
    </div>
    <input type="checkbox" className="toggle toggle-primary" checked={checked} onChange={(event) => onChange(event.target.checked)} />
  </div>
);

const SettingsPanel = ({ onClose, onOpenProfile }) => {
  const { authUser } = useAuthStore();
  const { activeStatus, setActiveStatus } = useAuthStore();
  const { language } = useLanguageStore();
  const { users } = useChatStore();
  const { actions, removeUserAction } = useSidebarActions();
  const [soundEnabled, setSoundEnabled] = useStateFromStorage("pingme-sound-enabled", true);
  const [doNotDisturb, setDoNotDisturb] = useStateFromStorage("pingme-dnd", false);
  const [showSnooze, setShowSnooze] = useState(false);
  const [snoozeChoice, setSnoozeChoice] = useState("Trong 1 giờ");
  const [detailSection, setDetailSection] = useState(null);
  const { theme, setTheme } = useThemeStore();
  const darkMode = theme === "light" ? "Tắt" : theme === "coffee" ? "Bật" : "Tự động";
  const setDarkMode = (mode) => setTheme(mode === "Tắt" ? "light" : mode === "Bật" ? "coffee" : "dark");

  return (
    <PanelShell title={t(language, "options")} onClose={onClose}>
      <div className="space-y-4">
        <section>
          <h3 className="mb-2 px-3 text-xl font-bold">{pc(language, "account")}</h3>
          <AccountPreview authUser={authUser} onOpenProfile={onOpenProfile} language={language} />
        </section>

        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-xl p-3 text-left font-bold hover:bg-base-300"
          onClick={() => setActiveStatus(!activeStatus)}
        >
          <UserCircle className="size-5" />
          {pc(language, "activeStatus")}: {activeStatus ? pc(language, "activeOn") : pc(language, "activeOff")}
        </button>

        <section className="border-t border-base-300 pt-3">
          <h3 className="px-3 text-xl font-bold">{pc(language, "notifications")}</h3>
          <ToggleRow
            icon={Volume2}
            title={pc(language, "sound")}
            description={pc(language, "soundDesc")}
            checked={soundEnabled}
            onChange={setSoundEnabled}
          />
          <ToggleRow
            icon={Bell}
            title={pc(language, "dnd")}
            description={pc(language, "dndDesc")}
            checked={doNotDisturb}
            onChange={(value) => {
              setDoNotDisturb(value);
              setShowSnooze(value);
            }}
          />
        </section>

        <section className="border-t border-base-300 pt-3">
          <div className="flex gap-3 rounded-xl p-3">
            <Moon className="mt-1 size-5" />
            <div className="space-y-3">
              <div>
                <div className="font-bold">{pc(language, "darkMode")}</div>
                <p className="text-sm text-base-content/60">{pc(language, "darkDesc")}</p>
              </div>
              {["Tắt", "Bật", "Tự động"].map((mode) => (
                <label key={mode} className="flex cursor-pointer items-center justify-between gap-8">
                  <span className="font-semibold">{pc(language, mode === "Tắt" ? "off" : mode === "Bật" ? "on" : "auto")}</span>
                  <input type="radio" className="radio radio-primary radio-sm" checked={darkMode === mode} onChange={() => setDarkMode(mode)} />
                </label>
              ))}
            </div>
          </div>
        </section>

        <button type="button" className="flex w-full items-center justify-between rounded-xl p-3 text-left font-bold hover:bg-base-300">
          <span className="flex items-center gap-3"><Shield className="size-5" />{pc(language, "payments")}</span>
          <ChevronRight className="size-5" />
        </button>

        {["messagingActivity", "blocking"].map((key) => (
          <button key={key} type="button" className="flex w-full items-center justify-between rounded-xl p-3 text-left font-bold hover:bg-base-300" onClick={() => setDetailSection(key)}>
            <span className="flex items-center gap-3"><Shield className="size-5" />{pc(language, key)}</span>
            <ChevronRight className="size-5" />
          </button>
        ))}
      </div>

      {detailSection && (
        <SettingsDetail section={detailSection} onBack={() => setDetailSection(null)} language={language} users={users} actions={actions} removeUserAction={removeUserAction} />
      )}

      {showSnooze && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
          <div className="w-96 rounded-xl bg-base-100 p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold">{pc(language, "snoozeTitle")}</h3>
              <button type="button" onClick={() => setShowSnooze(false)}><X className="size-5" /></button>
            </div>
            <p className="mb-4 text-sm text-base-content/70">{pc(language, "snoozeBody")}</p>
            <div className="space-y-2">
              {snoozeOptions.map((option) => (
                <label key={option} className="flex cursor-pointer items-center justify-between rounded-lg p-3 font-semibold hover:bg-base-300">
                  <span>{option}</span>
                  <input type="radio" className="radio radio-primary radio-sm" checked={snoozeChoice === option} onChange={() => setSnoozeChoice(option)} />
                </label>
              ))}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button className="btn btn-ghost" onClick={() => {
                setDoNotDisturb(false);
                setShowSnooze(false);
              }}>{pc(language, "cancel")}</button>
              <button className="btn btn-primary" onClick={() => {
                const duration = snoozeDurations[snoozeChoice];
                localStorage.setItem("pingme-dnd-until", duration ? String(Date.now() + duration) : "manual");
                setDoNotDisturb(true);
                setShowSnooze(false);
              }}>{pc(language, "next")}</button>
            </div>
          </div>
        </div>
      )}
    </PanelShell>
  );
};

function useStateFromStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}

function useSidebarActions() {
  const [actions, setActions] = useStateFromStorage(sidebarActionStorageKey, {});
  const removeUserAction = (key, userId) => {
    setActions((current) => ({
      ...current,
      [key]: (current[key] || []).filter((id) => id !== userId),
    }));
  };
  return { actions, removeUserAction };
}

const ListPanel = ({ title, people, description, actionLabel, onAction, onClose, language }) => (
  <PanelShell title={title} onClose={onClose}>
    {description && <p className="mb-5 text-sm text-base-content/70">{description}</p>}
    <label className="input input-sm mb-4 flex h-10 items-center gap-2 rounded-full border-none bg-base-300 px-4">
      <Search className="size-4" />
      <input className="grow" placeholder={language === "vi" ? "Tìm kiếm" : "Search"} />
    </label>
    {title === t(language, "requests") && (
      <div className="mb-4 flex gap-2">
        {[(language === "vi" ? "Bạn có thể biết" : "You may know"), "Spam"].map((tab, index) => (
          <button key={tab} type="button" className={`rounded-full px-4 py-2 text-sm font-bold ${index === 0 ? "bg-primary/15 text-primary" : "hover:bg-base-300"}`}>{tab}</button>
        ))}
      </div>
    )}
    <div className="space-y-1">
      {people.length > 0 ? people.map((person) => (
        <div key={person._id || person} className="flex w-full items-center gap-3 rounded-xl p-3 text-left hover:bg-base-300">
          <img src={person.profilePic || "/avatar.png"} alt="" className="size-12 rounded-full" />
          <div className="min-w-0 flex-1">
            <div className="truncate font-bold">{person.fullName || person}</div>
            <div className="text-sm text-base-content/60">{language === "vi" ? "Tin nhắn không hiển thị" : "Hidden message"} · 3 năm</div>
          </div>
          {actionLabel && <button type="button" className="btn btn-sm" onClick={() => onAction?.(person)}>{actionLabel}</button>}
        </div>
      )) : (
        <div className="rounded-2xl bg-base-100 p-6 text-center text-sm text-base-content/60">
          {language === "vi" ? "Chưa có dữ liệu trong mục này." : "No data in this section yet."}
        </div>
      )}
    </div>
  </PanelShell>
);

const SettingsDetail = ({ section, onBack, language, users = [], actions = {}, removeUserAction = () => {} }) => {
  const isMessaging = section === "messagingActivity";
  const title = pc(language, section);
  const blockedUsers = users.filter((user) => (actions.blocked || []).includes(user._id));
  const rows = isMessaging
    ? (language === "vi" ? [
        ["Bạn bè của bạn", "Cách tìm và liên hệ với bạn"],
        ["Bạn của bạn bè", "Ai có thể gửi cho bạn lời mời kết bạn?"],
        ["Chỉ mình tôi", "Ai có thể xem danh sách bạn bè của bạn?"],
        ["Có thể có mối liên hệ", "PingMe có thể gợi ý trang cá nhân của bạn cho ai dựa trên email?"],
        ["Bạn của bạn bè", "Những người có số điện thoại của bạn"],
        ["Tắt", "Công cụ tìm kiếm ngoài hệ thống liên kết đến trang cá nhân của bạn"],
        [t(language, "requests"), "Với những người có số điện thoại của bạn"],
        [t(language, "chats"), "Với bạn của bạn bè trên PingMe"],
        [t(language, "chats"), "Gửi tin nhắn đang chờ từ những người trong nhóm của bạn đến"],
        [t(language, "requests"), "Với những người khác trên PingMe"],
      ] : [
        ["Your friends", "How people find and contact you"],
        ["Friends of friends", "Who can send you friend requests?"],
        ["Only me", "Who can see your friend list?"],
        ["Possible connection", "Who can PingMe suggest your profile to based on email?"],
        ["Friends of friends", "People with your phone number"],
        ["Off", "Allow external search engines to link to your profile"],
        [t(language, "requests"), "People with your phone number"],
        [t(language, "chats"), "Friends of friends on PingMe"],
        [t(language, "chats"), "Send requests from people in your groups to"],
        [t(language, "requests"), "Other people on PingMe"],
      ]
      )
    : [
        [language === "vi" ? "Chỉnh sửa" : "Edit", language === "vi" ? "Danh sách hạn chế" : "Restricted list"],
        [language === "vi" ? "Chỉnh sửa" : "Edit", language === "vi" ? "Chặn trang cá nhân và Trang" : "Block profiles and pages"],
        [language === "vi" ? "Chỉnh sửa" : "Edit", language === "vi" ? "Biệt danh bị chặn" : "Blocked nicknames"],
        [language === "vi" ? "Chỉnh sửa" : "Edit", language === "vi" ? "Chặn tin nhắn" : "Blocked messages"],
      ];

  return (
    <div className="absolute inset-0 z-40 bg-base-200 p-4">
      <div className="mb-4 flex items-center gap-3">
        <button type="button" className="btn btn-circle btn-sm border-none bg-base-300" onClick={onBack}>
          <ArrowLeft className="size-5" />
        </button>
        <h3 className="text-xl font-bold">{title}</h3>
      </div>
      <p className="mb-4 text-sm text-base-content/70">
        {isMessaging
          ? (language === "vi" ? "Cách tìm và liên hệ với bạn, cũng như cách bạn nhận tin nhắn đang chờ." : "Control how people find and contact you, and how you receive message requests.")
          : (language === "vi" ? "Đang chặn. Quản lý những tài khoản, biệt danh và tin nhắn bị hạn chế hoặc bị chặn." : "Manage restricted accounts, blocked nicknames, and blocked messages.")}
      </p>
      <div className="space-y-2">
        {rows.map(([value, label]) => (
          <button key={label} type="button" className="flex w-full items-center justify-between rounded-xl p-3 text-left hover:bg-base-300">
            <span>
              <span className="block font-bold">{label}</span>
              <span className="text-sm text-base-content/60">
                {isMessaging ? value : (language === "vi" ? "Khi chỉnh sửa, bạn có thể cập nhật danh sách này trong giao diện quản lý chặn." : "Edit this list in the blocking management interface.")}
              </span>
            </span>
            {isMessaging ? <ChevronRight className="size-5 shrink-0" /> : <span className="btn btn-sm">{language === "vi" ? "Chỉnh sửa" : "Edit"}</span>}
          </button>
        ))}
      </div>
    </div>
  );
};

const PrivacyPanel = ({ onClose, language }) => (
  <PanelShell title={t(language, "privacy")} onClose={onClose}>
    {(language === "vi" ? [
      ["Trạng thái hoạt động", "Kiểm soát ai có thể thấy khi bạn đang hoạt động."],
      [t(language, "requests"), "Quản lý cách người lạ gửi tin nhắn cho bạn."],
      [t(language, "restricted"), "Xem và quản lý danh sách tài khoản bị hạn chế."],
      [t(language, "block"), "Chặn tài khoản, tin nhắn hoặc biệt danh không mong muốn."],
      ["Báo cáo sự cố", "Gửi báo cáo khi bạn gặp nội dung hoặc hành vi không phù hợp."],
    ] : [
      ["Active status", "Control who can see when you are active."],
      [t(language, "requests"), "Manage how unknown people can message you."],
      [t(language, "restricted"), "View and manage restricted accounts."],
      [t(language, "block"), "Block unwanted accounts, messages, or nicknames."],
      ["Report a problem", "Report inappropriate content or behavior."],
    ]).map(([title, desc]) => (
      <button key={title} type="button" className="flex w-full items-center justify-between border-b border-base-300 p-3 text-left hover:bg-base-300">
        <span>
          <span className="block font-bold">{title}</span>
          <span className="text-sm text-base-content/60">{desc}</span>
        </span>
        <ChevronRight className="size-5 shrink-0" />
      </button>
    ))}
  </PanelShell>
);

const ChatPanel = ({ panel, onClose, onOpenProfile }) => {
  const { language } = useLanguageStore();
  const { users } = useChatStore();
  const { actions, removeUserAction } = useSidebarActions();
  const archivedChats = users.filter((user) => (actions.archived || []).includes(user._id));
  const restrictedAccounts = users.filter((user) => (actions.blocked || []).includes(user._id));
  if (!panel) return null;
  if (panel === "settings") return <SettingsPanel onClose={onClose} onOpenProfile={onOpenProfile} />;
  if (panel === "requests") return <ListPanel title={t(language, "requests")} people={samplePeople} description={language === "vi" ? "Bạn có thể mở tin nhắn đang chờ để biết thêm thông tin về người gửi." : "Open message requests to learn more about senders."} onClose={onClose} language={language} />;
  if (panel === "archived") return <ListPanel title={t(language, "archived")} people={archivedChats} actionLabel={language === "vi" ? "Bỏ lưu trữ" : "Unarchive"} onAction={(user) => removeUserAction("archived", user._id)} onClose={onClose} language={language} />;
  if (panel === "restricted") return <ListPanel title={t(language, "restricted")} people={restrictedAccounts} actionLabel={language === "vi" ? "Bỏ chặn" : "Unblock"} onAction={(user) => removeUserAction("blocked", user._id)} description={language === "vi" ? "Bạn có thể giới hạn hoạt động tương tác với ai đó mà không phải chặn họ." : "Limit interactions with someone without blocking them."} onClose={onClose} language={language} />;
  if (panel === "privacy") return <PrivacyPanel onClose={onClose} language={language} />;
  return null;
};

export default ChatPanel;
