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
    profile, posts, profileFriends, isLoading, getProfile, getUserPosts,
    getRelationship, getProfileFriends, updateProfile, updateProfileMedia,
  } = useSocialStore();
  const [editorOpen, setEditorOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Tất cả");
  const profileId = userId || "me";
  const tabs = ["Tất cả", "Giới thiệu", "Bạn bè", "Ảnh", "Video"];

  useEffect(() => {
    getProfile(profileId);
    getUserPosts(profileId);
    getProfileFriends(profileId);
    if (userId && userId !== "me") getRelationship(userId);
  }, [getProfile, getProfileFriends, getRelationship, getUserPosts, profileId, userId]);

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
  const visibleMedia = posts.flatMap((post) => post.media || []);
  const tabMedia = visibleMedia.filter((media) =>
    activeTab === "Video" ? media.type === "video" : media.type === "image"
  );
  const moveTab = (event, currentTab) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const currentIndex = tabs.indexOf(currentTab);
    const nextIndex = event.key === "Home" ? 0
      : event.key === "End" ? tabs.length - 1
        : (currentIndex + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
    setActiveTab(tabs[nextIndex]);
    document.getElementById(`profile-tab-${tabs[nextIndex]}`)?.focus();
  };

  return (
    <main className="min-h-dvh overflow-x-hidden bg-base-200 pt-16">
      <ProfileHeader profile={profile} onEdit={() => setEditorOpen(true)} onEditMedia={handleMedia} />
      <nav className="sticky top-16 z-20 overflow-x-auto border-b border-base-300 bg-base-100" aria-label="Nội dung trang cá nhân">
        <div role="tablist" className="mx-auto flex max-w-6xl gap-1 px-4">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              id={`profile-tab-${tab}`}
              aria-controls="profile-tabpanel"
              aria-selected={activeTab === tab}
              tabIndex={activeTab === tab ? 0 : -1}
              className={`btn btn-ghost min-h-12 shrink-0 rounded-none ${activeTab === tab ? "border-b-2 border-primary text-primary" : ""}`}
              onClick={() => setActiveTab(tab)}
              onKeyDown={(event) => moveTab(event, tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </nav>
      <div id="profile-tabpanel" role="tabpanel" aria-labelledby={`profile-tab-${activeTab}`} className={`mx-auto grid max-w-6xl grid-cols-1 gap-4 px-3 py-5 lg:px-4 ${
        ["Tất cả", "Giới thiệu"].includes(activeTab) ? "lg:grid-cols-[22rem_minmax(0,1fr)]" : ""
      }`}>
        {["Tất cả", "Giới thiệu"].includes(activeTab) && <aside className="space-y-4">
          <ProfileIntroCard profile={profile} onEdit={() => setEditorOpen(true)} />
          {activeTab === "Tất cả" && <section className="rounded-xl border border-base-300 bg-base-100 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Bạn bè</h2>
                <p className="text-base-content/55">{profile.friendCount || 0} người bạn</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {profileFriends.slice(0, 9).map((friend) => (
                <Link key={friend._id} to={`/profile/${friend._id}`} className="min-w-0">
                  <img src={friend.profilePic || "/avatar.png"} alt="" loading="lazy" decoding="async" className="aspect-square w-full rounded-lg object-cover" />
                  <span className="mt-1 block truncate text-sm font-semibold">{friend.fullName}</span>
                </Link>
              ))}
            </div>
          </section>}
        </aside>}
        {activeTab === "Tất cả" && <section className="min-w-0 space-y-4">
          {profile.isOwner && <PostComposer authUser={authUser} />}
          {posts.length ? posts.map((post) => (
            <PostCard key={post._id} post={post} />
          )) : (
            <div className="rounded-xl border border-base-300 bg-base-100 p-10 text-center text-base-content/55">
              Chưa có bài viết nào.
            </div>
          )}
        </section>}
        {activeTab === "Bạn bè" && (
          <section className="rounded-xl border border-base-300 bg-base-100 p-5">
            <h2 className="text-2xl font-bold">Bạn bè</h2>
            <p className="text-base-content/55">{profileFriends.length} người bạn</p>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {profileFriends.map((friend) => (
                <Link key={friend._id} to={`/profile/${friend._id}`} className="min-w-0 rounded-xl p-2 hover:bg-base-200">
                  <img src={friend.profilePic || "/avatar.png"} alt="" className="aspect-square w-full rounded-lg object-cover" />
                  <span className="mt-2 block truncate font-semibold">{friend.fullName}</span>
                </Link>
              ))}
            </div>
          </section>
        )}
        {["Ảnh", "Video"].includes(activeTab) && (
          <section className="rounded-xl border border-base-300 bg-base-100 p-5">
            <h2 className="text-2xl font-bold">{activeTab}</h2>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {tabMedia.map((media) => media.type === "video" ? (
                <video key={media.key || media.url} src={media.url} controls className="aspect-square w-full rounded-lg bg-black object-cover" />
              ) : (
                <img key={media.key || media.url} src={media.url} alt="Nội dung bài viết" className="aspect-square w-full rounded-lg object-cover" />
              ))}
            </div>
            {!tabMedia.length && <p className="py-12 text-center text-base-content/55">Chưa có nội dung.</p>}
          </section>
        )}
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
