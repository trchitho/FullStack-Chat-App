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

const samplePeople = ["Nguyễn Thắng", "Trần Đình Huy Hoàng", "Son Ngoc Pham", "Bách Ngô"];
const archivedChats = ["Huy Nguyễn", "Ngô Thảo", "Nguyễn Tiến Thịnh", "Nguyễn Bá Khoa"];
const restrictedAccounts = ["Bo Nè", "Lieu Le", "天 雪"];
const snoozeOptions = ["Trong 15 phút", "Trong 1 giờ", "Trong 8 giờ", "Trong 24 giờ", "Đến khi tắt"];
const snoozeDurations = {
  "Trong 15 phút": 15 * 60 * 1000,
  "Trong 1 giờ": 60 * 60 * 1000,
  "Trong 8 giờ": 8 * 60 * 60 * 1000,
  "Trong 24 giờ": 24 * 60 * 60 * 1000,
};

const PanelShell = ({ title, children, onClose, onBack }) => (
  <div className="absolute inset-0 z-40 flex bg-base-100/70 backdrop-blur-sm">
    <aside className="h-full w-[360px] border-r border-base-300 bg-base-200 p-4 shadow-xl">
      <div className="mb-4 flex items-center gap-3">
        <button type="button" className="btn btn-circle btn-sm border-none bg-base-300" onClick={onBack || onClose}>
          {onBack ? <ArrowLeft className="size-5" /> : <X className="size-5" />}
        </button>
        <h2 className="text-2xl font-bold">{title}</h2>
      </div>
      {children}
    </aside>
    <div className="min-w-0 flex-1 bg-base-100" onClick={onClose} />
  </div>
);

const AccountPreview = ({ authUser, onOpenProfile }) => (
  <button type="button" className="flex w-full items-center gap-3 rounded-xl p-3 text-left hover:bg-base-300" onClick={onOpenProfile}>
    <img src={authUser?.profilePic || "/avatar.png"} alt={authUser?.fullName} className="size-12 rounded-full object-cover" />
    <div>
      <div className="font-bold">{authUser?.fullName || "Tài khoản"}</div>
      <div className="text-sm text-base-content/60">Xem trang cá nhân của bạn</div>
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
  const [soundEnabled, setSoundEnabled] = useStateFromStorage("messenger-sound-enabled", true);
  const [doNotDisturb, setDoNotDisturb] = useStateFromStorage("messenger-dnd", false);
  const [showSnooze, setShowSnooze] = useState(false);
  const [snoozeChoice, setSnoozeChoice] = useState("Trong 1 giờ");
  const [detailSection, setDetailSection] = useState(null);
  const { theme, setTheme } = useThemeStore();
  const darkMode = theme === "light" ? "Tắt" : theme === "coffee" ? "Bật" : "Tự động";
  const setDarkMode = (mode) => setTheme(mode === "Tắt" ? "light" : mode === "Bật" ? "coffee" : "dark");

  return (
    <PanelShell title="Tùy chọn" onClose={onClose}>
      <div className="space-y-4">
        <section>
          <h3 className="mb-2 px-3 text-xl font-bold">Tài khoản</h3>
          <AccountPreview authUser={authUser} onOpenProfile={onOpenProfile} />
        </section>

        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-xl p-3 text-left font-bold hover:bg-base-300"
          onClick={() => setActiveStatus(!activeStatus)}
        >
          <UserCircle className="size-5" />
          Trạng thái hoạt động: {activeStatus ? "ĐANG BẬT" : "ĐANG TẮT"}
        </button>

        <section className="border-t border-base-300 pt-3">
          <h3 className="px-3 text-xl font-bold">Thông báo</h3>
          <ToggleRow
            icon={Volume2}
            title="Âm thanh thông báo"
            description="Dùng thông báo bằng âm thanh để biết về tin nhắn, cuộc gọi đến, đoạn chat video và âm thanh trong ứng dụng."
            checked={soundEnabled}
            onChange={setSoundEnabled}
          />
          <ToggleRow
            icon={Bell}
            title="Không làm phiền"
            description="Tắt thông báo trong một khoảng thời gian cụ thể."
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
                <div className="font-bold">Chế độ tối</div>
                <p className="text-sm text-base-content/60">Điều chỉnh giao diện của Messenger để giảm độ chói và cho đôi mắt được nghỉ ngơi.</p>
              </div>
              {["Tắt", "Bật", "Tự động"].map((mode) => (
                <label key={mode} className="flex cursor-pointer items-center justify-between gap-8">
                  <span className="font-semibold">{mode}</span>
                  <input type="radio" className="radio radio-primary radio-sm" checked={darkMode === mode} onChange={() => setDarkMode(mode)} />
                </label>
              ))}
            </div>
          </div>
        </section>

        <button type="button" className="flex w-full items-center justify-between rounded-xl p-3 text-left font-bold hover:bg-base-300">
          <span className="flex items-center gap-3"><Shield className="size-5" />Quản lý khoản thanh toán</span>
          <ChevronRight className="size-5" />
        </button>

        {["Quản lý hoạt động gửi tin nhắn", "Quản lý phần Chặn"].map((label) => (
          <button key={label} type="button" className="flex w-full items-center justify-between rounded-xl p-3 text-left font-bold hover:bg-base-300" onClick={() => setDetailSection(label)}>
            <span className="flex items-center gap-3"><Shield className="size-5" />{label}</span>
            <ChevronRight className="size-5" />
          </button>
        ))}
      </div>

      {detailSection && (
        <SettingsDetail title={detailSection} onBack={() => setDetailSection(null)} />
      )}

      {showSnooze && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
          <div className="w-96 rounded-xl bg-base-100 p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold">Tắt thông báo</h3>
              <button type="button" onClick={() => setShowSnooze(false)}><X className="size-5" /></button>
            </div>
            <p className="mb-4 text-sm text-base-content/70">Cửa sổ chat vẫn đóng và bạn sẽ không nhận được thông báo đẩy trên thiết bị.</p>
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
              }}>Hủy</button>
              <button className="btn btn-primary" onClick={() => {
                const duration = snoozeDurations[snoozeChoice];
                localStorage.setItem("messenger-dnd-until", duration ? String(Date.now() + duration) : "manual");
                setDoNotDisturb(true);
                setShowSnooze(false);
              }}>Tiếp</button>
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

const ListPanel = ({ title, people, description, onClose }) => (
  <PanelShell title={title} onClose={onClose}>
    {description && <p className="mb-5 text-sm text-base-content/70">{description}</p>}
    <label className="input input-sm mb-4 flex h-10 items-center gap-2 rounded-full border-none bg-base-300 px-4">
      <Search className="size-4" />
      <input className="grow" placeholder="Tìm kiếm" />
    </label>
    <div className="space-y-1">
      {people.map((person) => (
        <button key={person} type="button" className="flex w-full items-center gap-3 rounded-xl p-3 text-left hover:bg-base-300">
          <img src="/avatar.png" alt="" className="size-12 rounded-full" />
          <div>
            <div className="font-bold">{person}</div>
            <div className="text-sm text-base-content/60">Tin nhắn không hiển thị · 3 năm</div>
          </div>
        </button>
      ))}
    </div>
  </PanelShell>
);

const SettingsDetail = ({ title, onBack }) => {
  const isMessaging = title.includes("gửi tin nhắn");
  const rows = isMessaging
    ? [
        ["Bạn bè của bạn", "Ai có thể gửi cho bạn lời mời kết bạn?"],
        ["Bạn của bạn bè", "Ai có thể xem danh sách bạn bè của bạn?"],
        ["Chỉ mình tôi", "Những người có địa chỉ email của bạn"],
        ["Có thể có mối liên hệ", "Những người có số điện thoại của bạn"],
        ["Tin nhắn đang chờ", "Với những người khác trên Messenger hoặc Facebook"],
      ]
    : [
        ["Danh sách hạn chế", "Giới hạn hoạt động tương tác mà không cần chặn."],
        ["Chặn trang cá nhân và Trang", "Hai bên không thể tương tác với bài viết, bình luận hoặc tin nhắn."],
        ["Biệt danh bị chặn", "Họ không thể gắn thẻ bạn hay tương tác với nội dung của bạn."],
        ["Chặn tin nhắn", "Chặn liên hệ trong Messenger và các trang cá nhân liên quan."],
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
          ? "Cách tìm và liên hệ với bạn, cũng như cách bạn nhận tin nhắn đang chờ."
          : "Quản lý những trang cá nhân và Trang đang bị hạn chế hoặc bị chặn."}
      </p>
      <div className="space-y-2">
        {rows.map(([value, label]) => (
          <button key={label} type="button" className="flex w-full items-center justify-between rounded-xl p-3 text-left hover:bg-base-300">
            <span>
              <span className="block font-bold">{label}</span>
              <span className="text-sm text-base-content/60">{value}</span>
            </span>
            <ChevronRight className="size-5 shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
};

const HelpPanel = ({ onClose }) => (
  <PanelShell title="Trợ giúp" onClose={onClose}>
    <h3 className="text-xl font-bold">Chúng tôi có thể giúp gì cho bạn?</h3>
    <label className="input input-sm my-4 flex h-11 items-center gap-2 rounded-full border-none bg-base-300 px-4">
      <Search className="size-4" />
      <input className="grow" placeholder="Tìm kiếm bài viết trợ giúp..." />
    </label>
    <div className="grid gap-2 md:grid-cols-2">
      {["Tính năng trên Messenger", "Quản lý tài khoản", "Quyền riêng tư và an toàn", "Thanh toán và kinh doanh"].map((item) => (
        <button key={item} type="button" className="rounded-xl bg-base-100 p-3 text-left font-semibold hover:bg-base-300">{item}</button>
      ))}
    </div>
    <h4 className="mt-5 font-bold">Chủ đề thịnh hành</h4>
    {["Khôi phục đoạn chat", "Quản lý thông báo", "Báo cáo tin nhắn hoặc cuộc trò chuyện", "Chặn tài khoản", "Tùy chỉnh giao diện"].map((item) => (
      <button key={item} type="button" className="flex w-full items-center justify-between rounded-xl p-3 text-left font-semibold hover:bg-base-300">
        {item}
        <ChevronRight className="size-5" />
      </button>
    ))}
    <div className="fixed bottom-6 right-6 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-content shadow-2xl">Chat trợ giúp</div>
  </PanelShell>
);

const PrivacyPanel = ({ onClose }) => (
  <PanelShell title="Quyền riêng tư và an toàn" onClose={onClose}>
    {[
      ["Trạng thái hoạt động", "Kiểm soát ai có thể thấy khi bạn đang hoạt động."],
      ["Tin nhắn đang chờ", "Quản lý cách người lạ gửi tin nhắn cho bạn."],
      ["Tài khoản đã hạn chế", "Xem và quản lý danh sách tài khoản bị hạn chế."],
      ["Chặn", "Chặn tài khoản, tin nhắn hoặc biệt danh không mong muốn."],
      ["Báo cáo sự cố", "Gửi báo cáo khi bạn gặp nội dung hoặc hành vi không phù hợp."],
    ].map(([title, desc]) => (
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

const MessengerPanel = ({ panel, onClose, onOpenProfile }) => {
  if (!panel) return null;
  if (panel === "settings") return <SettingsPanel onClose={onClose} onOpenProfile={onOpenProfile} />;
  if (panel === "requests") return <ListPanel title="Tin nhắn đang chờ" people={samplePeople} description="Bạn có thể mở tin nhắn đang chờ để biết thêm thông tin về người gửi." onClose={onClose} />;
  if (panel === "archived") return <ListPanel title="Đoạn chat đã lưu trữ" people={archivedChats} onClose={onClose} />;
  if (panel === "restricted") return <ListPanel title="Tài khoản đã hạn chế" people={restrictedAccounts} description="Bạn có thể giới hạn hoạt động tương tác với ai đó mà không phải chặn họ." onClose={onClose} />;
  if (panel === "privacy") return <PrivacyPanel onClose={onClose} />;
  if (panel === "help") return <HelpPanel onClose={onClose} />;
  return null;
};

export default MessengerPanel;
