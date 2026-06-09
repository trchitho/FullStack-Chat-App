import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, BookOpen, FileCheck2, LockKeyhole, Scale, Search } from "lucide-react";
import { Link } from "react-router-dom";
import MarkdownContent from "../components/MarkdownContent";

const policyTabs = [
  {
    id: "privacy",
    label: "Chính sách quyền riêng tư",
    description: "Cách PingMe thu thập, sử dụng, chia sẻ và bảo vệ dữ liệu.",
    icon: LockKeyhole,
    path: "/content/policies/privacy.md",
  },
  {
    id: "terms",
    label: "Điều khoản dịch vụ",
    description: "Quy định khi truy cập và sử dụng nền tảng PingMe.",
    icon: Scale,
    path: "/content/policies/terms.md",
  },
  {
    id: "standards",
    label: "Tiêu chuẩn cộng đồng",
    description: "Những nội dung và hành vi được phép hoặc không được phép.",
    icon: FileCheck2,
    path: "/content/policies/standards.md",
  },
];

const extractHeadings = (content) =>
  content.split(/\r?\n/)
    .filter((line) => line.startsWith("## "))
    .map((line) => line.replace(/^##\s+/, ""));

const PoliciesCenterPage = () => {
  const [activeTab, setActiveTab] = useState("privacy");
  const [documents, setDocuments] = useState({});
  const [query, setQuery] = useState("");
  const activePolicy = policyTabs.find((tab) => tab.id === activeTab) || policyTabs[0];
  const content = documents[activeTab] || "";

  useEffect(() => {
    Promise.all(policyTabs.map((tab) => fetch(tab.path).then((res) => res.text())))
      .then((texts) => {
        setDocuments(Object.fromEntries(policyTabs.map((tab, index) => [tab.id, texts[index]])));
      });
  }, []);

  const headings = useMemo(() => extractHeadings(content).slice(0, 8), [content]);
  const filteredTabs = policyTabs.filter((tab) =>
    `${tab.label} ${tab.description}`.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <Link to="/help/messages-app/" className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">
            <ArrowLeft className="size-4" />
            Trung tâm trợ giúp
          </Link>
          <Link to="/" className="rounded-full bg-slate-950 px-4 py-2 text-sm font-bold text-white">PingMe</Link>
        </div>
      </header>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 lg:grid-cols-[1fr_360px]">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
              <BookOpen className="size-4" />
              Trung tâm chính sách PingMe
            </div>
            <h1 className="max-w-3xl text-4xl font-bold tracking-tight md:text-5xl">
              Chính sách rõ ràng để bạn kiểm soát trải nghiệm của mình
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
              Tìm hiểu cách PingMe vận hành dịch vụ, bảo vệ quyền riêng tư và duy trì cộng đồng an toàn.
            </p>
          </div>
          <label className="flex h-14 items-center gap-3 self-end rounded-2xl border border-slate-200 bg-slate-50 px-4">
            <Search className="size-5 text-slate-500" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} className="min-w-0 flex-1 bg-transparent" placeholder="Tìm kiếm chính sách..." />
          </label>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-8 lg:grid-cols-[340px_1fr]">
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div className="space-y-3">
            {filteredTabs.map(({ id, label, description, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`w-full rounded-2xl border p-4 text-left transition ${activeTab === id ? "border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "border-slate-200 bg-white hover:border-slate-300"}`}
              >
                <span className="mb-3 flex items-center gap-3">
                  <span className={`flex size-10 items-center justify-center rounded-full ${activeTab === id ? "bg-white/15" : "bg-slate-100"}`}>
                    <Icon className="size-5" />
                  </span>
                  <span className="font-bold">{label}</span>
                </span>
                <span className={`block text-sm leading-6 ${activeTab === id ? "text-blue-50" : "text-slate-600"}`}>{description}</span>
              </button>
            ))}
          </div>

          {headings.length > 0 && (
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
              <div className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">Trong tài liệu này</div>
              <div className="space-y-2">
                {headings.map((heading) => (
                  <div key={heading} className="text-sm leading-6 text-slate-700">{heading}</div>
                ))}
              </div>
            </div>
          )}
        </aside>

        <article className="rounded-3xl border border-slate-200 bg-white px-5 py-7 shadow-sm md:px-10">
          <div className="mb-8 border-b border-slate-200 pb-5">
            <div className="text-sm font-semibold text-blue-700">{activePolicy.label}</div>
            <p className="mt-2 text-slate-600">{activePolicy.description}</p>
          </div>
          {content ? <MarkdownContent content={content} /> : <div className="text-slate-500">Đang tải nội dung...</div>}
        </article>
      </div>
    </main>
  );
};

export default PoliciesCenterPage;
