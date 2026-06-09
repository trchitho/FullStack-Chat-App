import { useEffect, useState } from "react";
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";

const emptyLogin = { username: "admin123", password: "" };

const AdminPage = () => {
  const [admin, setAdmin] = useState(null);
  const [login, setLogin] = useState(emptyLogin);
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance.get("/admin/check").then((res) => setAdmin(res.data)).catch(() => setAdmin(null)).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!admin) return;
    Promise.all([axiosInstance.get("/admin/overview"), axiosInstance.get("/admin/users")])
      .then(([overviewRes, usersRes]) => {
        setOverview(overviewRes.data);
        setUsers(usersRes.data);
      })
      .catch(() => toast.error("Không tải được dữ liệu admin"));
  }, [admin]);

  const submitLogin = async (event) => {
    event.preventDefault();
    const res = await axiosInstance.post("/admin/login", login);
    setAdmin(res.data);
  };

  if (loading) return <div className="flex min-h-dvh items-center justify-center">Đang tải...</div>;

  if (!admin) {
    return (
      <main className="flex min-h-dvh max-w-full items-center justify-center overflow-x-hidden bg-base-200 p-4">
        <form onSubmit={submitLogin} className="w-full max-w-sm rounded-2xl bg-base-100 p-6 shadow-2xl">
          <h1 className="mb-1 text-2xl font-bold">Admin PingMe</h1>
          <p className="mb-5 text-sm text-base-content/60">Khu vực quản trị chỉ hiển thị metadata, không xem nội dung riêng tư.</p>
          <input className="input input-bordered mb-3 w-full" value={login.username} onChange={(e) => setLogin({ ...login, username: e.target.value })} placeholder="Tài khoản" />
          <input className="input input-bordered mb-4 w-full" type="password" value={login.password} onChange={(e) => setLogin({ ...login, password: e.target.value })} placeholder="Mật khẩu" />
          <button className="btn btn-primary w-full">Đăng nhập admin</button>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-dvh max-w-full overflow-x-hidden bg-base-200 p-4 pt-20 sm:p-6 sm:pt-24">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold">Bảng điều khiển Admin</h1>
            <p className="text-base-content/60">Giám sát hoạt động hệ thống theo nguyên tắc không đọc nội dung riêng tư.</p>
          </div>
          <button className="btn" onClick={async () => { await axiosInstance.post("/admin/logout"); setAdmin(null); }}>Đăng xuất</button>
        </header>
        <section className="grid gap-4 md:grid-cols-4">
          {[
            ["Người dùng", overview?.totalUsers],
            ["Tin nhắn", overview?.totalMessages],
            ["File/ảnh/voice", overview?.attachmentMessages],
            ["Cuộc gọi", overview?.callMessages],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl bg-base-100 p-5 shadow">
              <div className="text-sm text-base-content/60">{label}</div>
              <div className="text-3xl font-bold">{value ?? 0}</div>
            </div>
          ))}
        </section>
        <section className="overflow-hidden rounded-2xl bg-base-100 shadow">
          <div className="border-b border-base-300 p-4">
            <h2 className="text-xl font-bold">Người dùng hệ thống</h2>
            <p className="text-sm text-base-content/60">Không hiển thị nội dung tin nhắn, token, mật khẩu hoặc dữ liệu riêng tư.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Người dùng</th>
                  <th>Email</th>
                  <th>Tin đã gửi</th>
                  <th>Hoạt động gần nhất</th>
                  <th>Ngày tạo</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <img src={user.profilePic || "/avatar.png"} alt="" className="size-10 rounded-full object-cover" />
                        <span className="font-semibold">{user.fullName}</span>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>{user.sentMessages || 0}</td>
                    <td>{user.lastActivityAt ? new Date(user.lastActivityAt).toLocaleString("vi-VN") : "Chưa có"}</td>
                    <td>{new Date(user.createdAt).toLocaleDateString("vi-VN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
};

export default AdminPage;
