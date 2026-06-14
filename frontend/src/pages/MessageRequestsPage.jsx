import { ArrowLeft, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSocialStore } from "../store/useSocialStore";

const MessageRequestsPage = () => {
  const navigate = useNavigate();
  const { messageRequests, getMessageRequests, respondToMessageRequest } = useSocialStore();
  const [query, setQuery] = useState("");

  useEffect(() => {
    getMessageRequests();
  }, [getMessageRequests]);

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();
    return messageRequests.filter((request) =>
      !search || request.requestedBy?.fullName?.toLowerCase().includes(search)
    );
  }, [messageRequests, query]);

  return (
    <main className="min-h-dvh overflow-x-hidden bg-base-200 px-3 pb-10 pt-20 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <header className="mb-5">
          <div className="flex items-center gap-3">
            <button type="button" className="btn btn-circle btn-ghost min-h-11 min-w-11" onClick={() => navigate(-1)} aria-label="Quay lại">
              <ArrowLeft className="size-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold">Tin nhắn đang chờ</h1>
              <p className="text-base-content/60">Xem trước tin nhắn từ những người chưa kết bạn.</p>
            </div>
          </div>
          <label className="input input-bordered mt-4 flex h-12 items-center gap-3 rounded-full bg-base-100">
            <Search className="size-5 text-base-content/55" />
            <input type="search" className="min-w-0 grow" placeholder="Tìm người gửi" value={query} onChange={(event) => setQuery(event.target.value)} />
          </label>
        </header>
        <section className="overflow-hidden rounded-xl border border-base-300 bg-base-100">
          {filtered.map((request) => (
            <article key={request._id} className="flex min-w-0 flex-col gap-3 border-b border-base-300 p-4 last:border-0 sm:flex-row sm:items-center">
              <img src={request.requestedBy?.profilePic || "/avatar.png"} alt="" className="size-14 shrink-0 rounded-full object-cover" />
              <div className="min-w-0 flex-1">
                <h2 className="truncate font-bold">{request.requestedBy?.fullName}</h2>
                <p className="truncate text-sm text-base-content/65">
                  {request.preview?.text || "Đã gửi một tin nhắn cho bạn"}
                </p>
                {request.preview?.createdAt && (
                  <time className="text-xs text-base-content/45">
                    {new Date(request.preview.createdAt).toLocaleString("vi-VN")}
                  </time>
                )}
              </div>
              <div className="flex gap-2">
                <button type="button" className="btn btn-primary btn-sm flex-1 sm:flex-none" onClick={() => respondToMessageRequest(request._id, "accept")}>
                  Chấp nhận
                </button>
                <button type="button" className="btn btn-ghost btn-sm flex-1 sm:flex-none" onClick={() => respondToMessageRequest(request._id, "delete")}>
                  Xóa
                </button>
              </div>
            </article>
          ))}
          {!filtered.length && <div className="p-12 text-center text-base-content/55">Không có tin nhắn đang chờ.</div>}
        </section>
      </div>
    </main>
  );
};

export default MessageRequestsPage;
