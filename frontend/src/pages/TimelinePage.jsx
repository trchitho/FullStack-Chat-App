import { useEffect } from "react";
import PostCard from "../components/PostCard";
import PostComposer from "../components/PostComposer";
import { useAuthStore } from "../store/useAuthStore";
import { useSocialStore } from "../store/useSocialStore";

const TimelinePage = () => {
  const authUser = useAuthStore((state) => state.authUser);
  const socket = useAuthStore((state) => state.socket);
  const { posts, isLoading, getTimeline, subscribeToTimeline, unsubscribeFromTimeline } = useSocialStore();

  useEffect(() => {
    getTimeline();
  }, [getTimeline]);

  useEffect(() => {
    if (!socket) return undefined;
    subscribeToTimeline(socket);
    return () => unsubscribeFromTimeline(socket);
  }, [socket, subscribeToTimeline, unsubscribeFromTimeline]);

  return (
    <main className="min-h-dvh overflow-x-hidden bg-base-200 px-3 pb-10 pt-20 sm:px-6">
      <div className="mx-auto max-w-2xl space-y-4">
        <header>
          <h1 className="text-3xl font-bold">Nhật ký</h1>
          <p className="text-base-content/60">Khoảnh khắc mới từ bạn và những người bạn quan tâm.</p>
        </header>
        <PostComposer authUser={authUser} />
        {isLoading ? (
          <div className="flex justify-center p-12"><span className="loading loading-spinner loading-lg" /></div>
        ) : posts.length ? posts.map((post) => (
          <PostCard key={post._id} post={post} />
        )) : (
          <div className="rounded-xl border border-base-300 bg-base-100 p-12 text-center text-base-content/55">
            Chưa có bài viết nào trong nhật ký.
          </div>
        )}
      </div>
    </main>
  );
};

export default TimelinePage;
