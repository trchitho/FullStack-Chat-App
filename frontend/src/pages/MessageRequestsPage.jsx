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
        </section>
      </div>
    </main>
  );
};

export default MessageRequestsPage;
