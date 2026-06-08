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

const samplePeople = ["Nguyễn Thắng", "Trần Đình Huy Hoàng", "Son Ngoc Pham", "Bách Ngô"];
const archivedChats = ["Huy Nguyễn", "Ngô Thảo", "Nguyễn Tiến Thịnh", "Nguyễn Bá Khoa"];
const restrictedAccounts = ["Bo Nè", "Lieu Le", "天 雪"];
const snoozeOptions = ["Trong 15 phút", "Trong 1 giờ", "Trong 8 giờ", "Trong 24 giờ", "Đến khi tắt"];

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
  const [activeStatus, setActiveStatus] = useStateFromStorage("messenger-active-status", true);
  const [soundEnabled, setSoundEnabled] = useStateFromStorage("messenger-sound-enabled", true);
  const [doNotDisturb, setDoNotDisturb] = useStateFromStorage("messenger-dnd", false);
  const [darkMode, setDarkMode] = useStateFromStorage("messenger-dark-mode", "Bật");
  const [showSnooze, setShowSnooze] = useState(false);

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

        {["Quản lý hoạt động gửi tin nhắn", "Quản lý phần Chặn"].map((label) => (
          <button key={label} type="button" className="flex w-full items-center justify-between rounded-xl p-3 text-left font-bold hover:bg-base-300">
            <span className="flex items-center gap-3"><Shield className="size-5" />{label}</span>
            <ChevronRight className="size-5" />
          </button>
        ))}
      </div>

      {showSnooze && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
          <div className="w-96 rounded-xl bg-base-100 p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold">Tắt thông báo</h3>
              <button type="button" onClick={() => setShowSnooze(false)}><X className="size-5" /></button>
            </div>
            <p className="mb-4 text-sm text-base-content/70">Cửa sổ chat vẫn đóng và bạn sẽ không nhận được thông báo đẩy trên thiết bị.</p>
            <div className="space-y-2">
              {snoozeOptions.map((option) => <button key={option} className="block w-full rounded-lg p-3 text-left font-semibold hover:bg-base-300">{option}</button>)}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button className="btn btn-ghost" onClick={() => setShowSnooze(false)}>Hủy</button>
              <button className="btn btn-primary" onClick={() => setShowSnooze(false)}>Tiếp</button>
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

const HelpPanel = ({ onClose }) => (
  <PanelShell title="Trợ giúp" onClose={onClose}>
    <p className="mb-4 text-sm text-base-content/70">Trung tâm trợ giúp Messenger</p>
    {["Đăng nhập và mật khẩu", "Quyền riêng tư và an toàn", "Tin nhắn", "Cuộc gọi thoại và video", "Báo cáo sự cố"].map((item) => (
      <a key={item} href="https://www.facebook.com/help/messenger-app/" target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-xl p-3 font-bold hover:bg-base-300">
        {item}
        <ChevronRight className="size-5" />
      </a>
    ))}
  </PanelShell>
);

const MessengerPanel = ({ panel, onClose, onOpenProfile }) => {
  if (!panel) return null;
  if (panel === "settings") return <SettingsPanel onClose={onClose} onOpenProfile={onOpenProfile} />;
  if (panel === "requests") return <ListPanel title="Tin nhắn đang chờ" people={samplePeople} description="Bạn có thể mở tin nhắn đang chờ để biết thêm thông tin về người gửi." onClose={onClose} />;
  if (panel === "archived") return <ListPanel title="Đoạn chat đã lưu trữ" people={archivedChats} onClose={onClose} />;
  if (panel === "restricted") return <ListPanel title="Tài khoản đã hạn chế" people={restrictedAccounts} description="Bạn có thể giới hạn hoạt động tương tác với ai đó mà không phải chặn họ." onClose={onClose} />;
  if (panel === "help") return <HelpPanel onClose={onClose} />;
  return null;
};

export default MessengerPanel;
