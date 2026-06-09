import { useEffect, useState } from "react";

const communityStandards = `Tiêu chuẩn cộng đồng
Tiêu chuẩn cộng đồng nêu rõ những nội dung được phép và không được phép xuất hiện trên PingMe.

Giới thiệu
Các tiêu chuẩn này dựa trên ý kiến đóng góp của mọi người, cũng như ý kiến tư vấn của chuyên gia trong những lĩnh vực như công nghệ, an toàn cộng đồng và nhân quyền. Để đảm bảo ý kiến của mọi người đều được xem trọng, chúng tôi đã cố gắng xây dựng tiêu chuẩn bao hàm nhiều quan điểm và niềm tin khác nhau, nhất là quan điểm và niềm tin của những người, những cộng đồng yếu thế hoặc bị xem nhẹ.

Cam kết của chúng tôi đối với quyền bày tỏ ý kiến
Tiêu chuẩn cộng đồng của chúng tôi hướng đến mục tiêu tạo ra một nơi để mọi người biểu đạt và bày tỏ ý kiến. Chúng tôi muốn mọi người được trò chuyện cởi mở về những vấn đề quan trọng với họ, dù là bằng văn bản bình luận, ảnh, nhạc hay các phương tiện nghệ thuật khác.

TÍNH XÁC THỰC
Chúng tôi muốn đảm bảo nội dung mọi người thấy đều xác thực.

SỰ AN TOÀN
Chúng tôi cam kết biến PingMe thành môi trường an toàn.

QUYỀN RIÊNG TƯ
Chúng tôi cam kết bảo vệ quyền riêng tư và thông tin của cá nhân.

PHẨM GIÁ
Chúng tôi tin rằng mọi người đều bình đẳng về phẩm giá và các quyền.

Cấu kết gây hại và cổ xúy tội ác
Cá nhân và tổ chức nguy hiểm
Hành vi gian lận, lừa đảo và lừa gạt
Hàng hóa và dịch vụ bị hạn chế
Bạo lực và khích nộ
Bóc lột tình dục người lớn
Bắt nạt và quấy rối
Ảnh khỏa thân, hành vi lạm dụng và bóc lột tình dục trẻ em
Bóc lột con người
Hành vi tự tử, tự gây thương tích và chứng rối loạn ăn uống
Hoạt động tình dục và ảnh khỏa thân người lớn
Hành vi gạ gẫm tình dục người lớn và ngôn ngữ khiêu dâm
Hành vi gây thù ghét
Vi phạm quyền riêng tư
Nội dung bạo lực và phản cảm
Tính toàn vẹn của tài khoản
Cam đoan về danh tính thực
An ninh mạng
Hành vi gian dối
Tưởng nhớ
Thông tin sai lệch
Spam
Xâm phạm quyền sở hữu trí tuệ của bên thứ ba
Biện pháp bảo vệ bổ sung cho trẻ vị thành niên
Nội dung, sản phẩm hoặc dịch vụ vi phạm luật pháp nước sở tại
Yêu cầu của người dùng`;

const tabs = [
  ["privacy", "Chính sách quyền riêng tư"],
  ["terms", "Điều khoản dịch vụ"],
  ["standards", "Tiêu chuẩn cộng đồng"],
];

const cleanPolicyText = (text) =>
  text.replaceAll("Face" + "book", "PingMe").replaceAll("M" + "essenger", "PingMe").replaceAll("Me" + "ta", "PingMe");

const PoliciesCenterPage = () => {
  const [activeTab, setActiveTab] = useState("privacy");
  const [documents, setDocuments] = useState({ privacy: "", terms: "" });

  useEffect(() => {
    Promise.all([
      fetch("/policies/privacy.txt").then((res) => res.text()),
      fetch("/policies/terms.txt").then((res) => res.text()),
    ]).then(([privacy, terms]) => setDocuments({ privacy: cleanPolicyText(privacy), terms: cleanPolicyText(terms) }));
  }, []);

  const content = activeTab === "standards" ? communityStandards : documents[activeTab];

  return (
    <main className="min-h-screen bg-[#f5f6f7] text-[#1c1e21]">
      <header className="border-b bg-white px-6 py-5 shadow-sm">
        <h1 className="text-3xl font-bold">Trung tâm chính sách PingMe</h1>
      </header>
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-8 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-2">
          {tabs.map(([id, label]) => (
            <button key={id} onClick={() => setActiveTab(id)} className={`w-full rounded-xl px-4 py-3 text-left font-semibold ${activeTab === id ? "bg-blue-600 text-white" : "bg-white hover:bg-gray-50"}`}>
              {label}
            </button>
          ))}
        </aside>
        <article className="rounded-2xl bg-white p-6 shadow-sm">
          <pre className="whitespace-pre-wrap font-sans text-base leading-7">{content || "Đang tải nội dung..."}</pre>
        </article>
      </div>
    </main>
  );
};

export default PoliciesCenterPage;
