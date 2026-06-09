import { useEffect, useMemo, useState } from "react";
import { ChevronDown, MessageCircle, Search, Shield, UserCircle } from "lucide-react";
import { Link } from "react-router-dom";
import MarkdownContent from "../components/MarkdownContent";

const articles = [
  ["01_ma_hoa_dau_cuoi_pingme.md", "Khái niệm và cách hoạt động của tính năng mã hóa đầu cuối trên PingMe", "Tính năng trên PingMe"],
  ["02_khoi_phuc_chat_ma_hoa_bang_pin_pingme.md", "Khôi phục đoạn chat được mã hóa đầu cuối bằng mã PIN trên PingMe", "Tính năng trên PingMe"],
  ["03_ma_hoa_dau_cuoi.md", "Mã hóa đầu cuối", "Tính năng trên PingMe"],
  ["04_hoi_pingme_ai_trong_doan_chat.md", "Hỏi PingMe AI trong đoạn chat", "Tính năng trên PingMe"],
  ["05_tai_xuong_hoac_cap_nhat_ung_dung_pingme.md", "Tải xuống hoặc cập nhật ứng dụng PingMe", "Quản lý tài khoản"],
  ["06_bao_cao_tin_nhan_hoac_cuoc_tro_chuyen_pingme.md", "Báo cáo tin nhắn hoặc cuộc trò chuyện trên PingMe", "Quyền riêng tư và an toàn"],
  ["07_chan_trang_ca_nhan_ai_do_tren_pingme.md", "Chặn trang cá nhân của ai đó trên PingMe", "Quyền riêng tư và an toàn"],
].map(([file, title, category]) => ({
  id: file.replace(".md", ""),
  file,
  title,
  category,
  path: `/content/help/${file}`,
}));

const categoryIcons = {
  "Tính năng trên PingMe": MessageCircle,
  "Quản lý tài khoản": UserCircle,
  "Quyền riêng tư và an toàn": Shield,
};

const fallbackCategories = [
  ["Tính năng trên PingMe", articles.filter((article) => article.category === "Tính năng trên PingMe").map((article) => article.title)],
  ["Quản lý tài khoản", articles.filter((article) => article.category === "Quản lý tài khoản").map((article) => article.title)],
  ["Quyền riêng tư và an toàn", articles.filter((article) => article.category === "Quyền riêng tư và an toàn").map((article) => article.title)],
];

const parseCategoryMarkdown = (content) => {
  const sections = [];
  let current = null;
  content.split(/\r?\n/).forEach((line) => {
    if (line.startsWith("## ")) {
      current = { title: line.replace(/^##\s+\d+\.\s*/, ""), items: [] };
      sections.push(current);
    } else if (current && line.startsWith("- ")) {
      current.items.push(line.slice(2));
    }
  });
  return sections.length ? sections.map((section) => [section.title, section.items]) : fallbackCategories;
};

const HelpCenterPage = () => {
  const [articleContent, setArticleContent] = useState({});
  const [categoryContent, setCategoryContent] = useState(fallbackCategories);
  const [activeArticleId, setActiveArticleId] = useState(articles[0].id);
  const [query, setQuery] = useState("");

  useEffect(() => {
    Promise.all(articles.map((article) => fetch(article.path).then((res) => res.text())))
      .then((texts) => setArticleContent(Object.fromEntries(articles.map((article, index) => [article.id, texts[index]]))));
    fetch("/content/help/muc_con_trung_tam_tro_giup_pingme.md")
      .then((res) => res.text())
      .then((text) => setCategoryContent(parseCategoryMarkdown(text)));
  }, []);

  const activeArticle = articles.find((article) => article.id === activeArticleId) || articles[0];
  const activeContent = articleContent[activeArticle.id] || "";
  const filteredArticles = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return articles;
    return articles.filter((article) => article.title.toLowerCase().includes(search));
  }, [query]);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-blue-600 text-white">
              <MessageCircle className="size-6" />
            </div>
            <h1 className="text-2xl font-bold">Trung tâm trợ giúp</h1>
          </div>
          <Link to="/" className="rounded-full bg-slate-100 px-4 py-2 font-semibold hover:bg-slate-200">PingMe</Link>
        </div>
      </header>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-4xl px-5 py-10 text-center">
          <h2 className="text-4xl font-bold tracking-tight md:text-5xl">Chúng tôi có thể giúp gì cho bạn?</h2>
          <label className="mx-auto mt-7 flex h-16 max-w-3xl items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-5">
            <Search className="size-6 text-slate-500" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} className="min-w-0 flex-1 bg-transparent text-lg outline-none" placeholder="Tìm kiếm bài viết trợ giúp..." />
          </label>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-8 lg:grid-cols-[340px_1fr]">
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          {categoryContent.map(([category, items]) => {
            const Icon = categoryIcons[category] || MessageCircle;
            return (
              <details key={category} open className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-bold">
                  <span className="flex items-center gap-3">
                    <span className="flex size-10 items-center justify-center rounded-full bg-slate-100"><Icon className="size-5" /></span>
                    {category}
                  </span>
                  <ChevronDown className="size-5 text-slate-500" />
                </summary>
                <div className="mt-4 space-y-1">
                  {items.map((item) => {
                    const article = articles.find((entry) => entry.title === item);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => article && setActiveArticleId(article.id)}
                        className={`block w-full rounded-xl px-3 py-2 text-left text-sm leading-6 ${article?.id === activeArticleId ? "bg-blue-50 font-bold text-blue-700" : "text-slate-600 hover:bg-slate-50"}`}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>
              </details>
            );
          })}
        </aside>

        <section className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-2xl font-bold">Chủ đề thịnh hành</h3>
            <div className="grid gap-3 md:grid-cols-2">
              {filteredArticles.map((article) => (
                <button
                  key={article.id}
                  type="button"
                  onClick={() => setActiveArticleId(article.id)}
                  className={`rounded-2xl border p-4 text-left transition ${article.id === activeArticleId ? "border-blue-600 bg-blue-50" : "border-slate-200 hover:border-blue-200 hover:bg-slate-50"}`}
                >
                  <div className="text-sm font-semibold text-blue-700">{article.category}</div>
                  <div className="mt-2 font-bold leading-6">{article.title}</div>
                </button>
              ))}
            </div>
          </div>

          <article className="rounded-3xl border border-slate-200 bg-white px-5 py-7 shadow-sm md:px-10">
            <div className="mb-7 border-b border-slate-200 pb-5">
              <div className="text-sm font-semibold text-blue-700">{activeArticle.category}</div>
              <h3 className="mt-2 text-3xl font-bold tracking-tight">{activeArticle.title}</h3>
            </div>
            {activeContent ? <MarkdownContent content={activeContent} /> : <div className="text-slate-500">Đang tải nội dung...</div>}
          </article>
        </section>
      </div>

      <footer className="mx-auto flex max-w-7xl justify-between px-5 pb-10 text-sm text-slate-600">
        <Link to="/policies_center" target="_blank" className="font-semibold text-blue-700 hover:underline">Điều khoản và chính sách</Link>
        <span>PingMe Help Center</span>
      </footer>
    </main>
  );
};

export default HelpCenterPage;
