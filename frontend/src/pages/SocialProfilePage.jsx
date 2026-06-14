import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import ProfileAboutEditor from "../components/ProfileAboutEditor";
import ProfileHeader from "../components/ProfileHeader";
import ProfileIntroCard from "../components/ProfileIntroCard";
import PostCard from "../components/PostCard";
import PostComposer from "../components/PostComposer";
import { useAuthStore } from "../store/useAuthStore";
import { useSocialStore } from "../store/useSocialStore";

const readFile = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

const SocialProfilePage = () => {
  const { userId } = useParams();
  const authUser = useAuthStore((state) => state.authUser);
  const {
    profile, posts, friends, isLoading, getProfile, getUserPosts,
    getRelationship, getFriends, updateProfile, updateProfileMedia,
  } = useSocialStore();
  const [editorOpen, setEditorOpen] = useState(false);
  const profileId = userId || "me";

  useEffect(() => {
    getProfile(profileId);
    getUserPosts(profileId);
    getFriends();
    if (userId) getRelationship(userId);
  }, [getFriends, getProfile, getRelationship, getUserPosts, profileId, userId]);

  const handleMedia = async (field, file) => {
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 10 * 1024 * 1024) {
      toast.error("Chỉ hỗ trợ ảnh tối đa 10MB");
      return;
    }
    const image = await readFile(file);
    await updateProfileMedia(field, image);
    toast.success("Đã cập nhật ảnh");
  };

  if (isLoading && !profile) {
    return <div className="flex min-h-dvh items-center justify-center pt-16"><span className="loading loading-spinner loading-lg" /></div>;
  }
  if (!profile) return <div className="p-24 text-center">Không tìm thấy trang cá nhân.</div>;

  return (
    <main className="min-h-dvh overflow-x-hidden bg-base-200 pt-16">
      <ProfileHeader profile={profile} onEdit={() => setEditorOpen(true)} onEditMedia={handleMedia} />
      <nav className="sticky top-16 z-20 overflow-x-auto border-b border-base-300 bg-base-100">
        <div className="mx-auto flex max-w-6xl gap-1 px-4">
          {["Tất cả", "Giới thiệu", "Bạn bè", "Ảnh", "Video"].map((tab) => (
            <button key={tab} type="button" className="btn btn-ghost min-h-12 shrink-0 rounded-none first:border-b-2 first:border-primary">
              {tab}
            </button>
          ))}
        </div>
      </nav>
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 px-3 py-5 lg:grid-cols-[22rem_minmax(0,1fr)] lg:px-4">
        <aside className="space-y-4">
          <ProfileIntroCard profile={profile} onEdit={() => setEditorOpen(true)} />
          <section className="rounded-xl border border-base-300 bg-base-100 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Bạn bè</h2>
                <p className="text-base-content/55">{profile.friendCount || 0} người bạn</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {friends.slice(0, 9).map((friend) => (
                <Link key={friend._id} to={`/profile/${friend._id}`} className="min-w-0">
                  <img src={friend.profilePic || "/avatar.png"} alt="" className="aspect-square w-full rounded-lg object-cover" />
                  <span className="mt-1 block truncate text-sm font-semibold">{friend.fullName}</span>
                </Link>
              ))}
            </div>
          </section>
        </aside>
        <section className="min-w-0 space-y-4">
          {profile.isOwner && <PostComposer authUser={authUser} />}
          {posts.length ? posts.map((post) => (
            <PostCard key={post._id} post={post} />
          )) : (
            <div className="rounded-xl border border-base-300 bg-base-100 p-10 text-center text-base-content/55">
              Chưa có bài viết nào.
            </div>
          )}
        </section>
      </div>
      <ProfileAboutEditor
        profile={profile}
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        onSave={async (draft) => {
          await updateProfile(draft);
          toast.success("Đã lưu thông tin cá nhân");
        }}
      />
    </main>
  );
};

export default SocialProfilePage;
