import { ChevronDown, MessageCircle, Search, Shield, UserCircle, WalletCards } from "lucide-react";
import { Link } from "react-router-dom";

const topics = [
  "Khái niệm và cách hoạt động của tính năng mã hóa đầu cuối trên PingMe",
  "Khôi phục đoạn chat được mã hóa đầu cuối bằng mã PIN trên PingMe",
  "Mã hóa đầu cuối",
  "Hỏi PingMe AI trong đoạn chat",
  "Tải xuống hoặc cập nhật ứng dụng PingMe",
  "Báo cáo tin nhắn hoặc cuộc trò chuyện trên PingMe",
  "Chặn trang cá nhân của ai đó trên PingMe",
];

const categories = [
  ["Tính năng trên PingMe", MessageCircle],
  ["Quản lý tài khoản", UserCircle],
  ["Quyền riêng tư và an toàn", Shield],
  ["Thanh toán và kinh doanh", WalletCards],
];

const HelpCenterPage = () => (
  <main className="min-h-screen bg-[#f5f6f7] text-[#1c1e21]">
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-white px-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-full bg-blue-600 text-white">
          <MessageCircle className="size-6" />
        </div>
        <h1 className="text-2xl font-bold">Trung tâm trợ giúp</h1>
      </div>
      <Link to="/" className="rounded-lg bg-gray-100 px-4 py-2 font-semibold hover:bg-gray-200">PingMe</Link>
    </header>

    <div className="mx-auto grid max-w-7xl gap-10 px-5 py-8 lg:grid-cols-[320px_1fr]">
      <aside className="space-y-3">
        {categories.map(([label, Icon]) => (
          <button key={label} className="flex w-full items-center justify-between rounded-xl bg-white px-4 py-4 text-left text-lg font-bold shadow-sm hover:bg-gray-50">
            <span className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-full bg-gray-100"><Icon className="size-5" /></span>
              {label}
            </span>
            <ChevronDown className="size-5 text-gray-500" />
          </button>
        ))}
      </aside>

      <section className="mx-auto w-full max-w-3xl">
        <h2 className="mb-5 text-4xl font-bold">Chúng tôi có thể giúp gì cho bạn?</h2>
        <label className="mb-14 flex h-16 items-center gap-4 rounded-2xl bg-white px-5 shadow-sm">
          <Search className="size-7 text-gray-500" />
          <input className="w-full bg-transparent text-xl outline-none" placeholder="Tìm kiếm bài viết trợ giúp..." />
        </label>

        <h3 className="mb-6 text-3xl font-bold">Chủ đề thịnh hành</h3>
        <div className="space-y-6">
          {topics.map((topic) => (
            <button key={topic} className="block w-full text-left text-2xl font-semibold leading-tight text-blue-600 hover:underline">
              {topic}
            </button>
          ))}
        </div>
      </section>
    </div>

    <div className="fixed bottom-5 right-5 w-[min(480px,calc(100vw-32px))] rounded-2xl bg-[#2f3033] p-4 text-white shadow-2xl">
      <div className="mb-3 font-semibold">Trợ lý hỗ trợ PingMe</div>
      <div className="flex gap-2">
        <input className="min-w-0 flex-1 rounded-full bg-white/10 px-4 py-3 outline-none" placeholder="Đặt câu hỏi..." />
        <button className="rounded-full bg-blue-600 px-4 font-bold">Gửi</button>
      </div>
    </div>

    <footer className="mx-auto max-w-7xl px-5 pb-10 text-sm text-gray-600">
      <Link to="/policies_center" target="_blank" className="font-semibold text-blue-600 hover:underline">Điều khoản</Link>
    </footer>
  </main>
);

export default HelpCenterPage;
