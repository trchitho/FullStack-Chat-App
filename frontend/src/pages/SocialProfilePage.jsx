import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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
      <ProfileHeader profile={profile} onEditMedia={handleMedia} />
      <nav className="sticky top-16 z-20 overflow-x-auto border-b border-base-300 bg-base-100">
        <div className="mx-auto flex max-w-6xl gap-1 px-4">
          {["Tất cả", "Giới thiệu", "Bạn bè", "Ảnh", "Video"].map((tab) => (
            <button key={tab} type="button" className="btn btn-ghost min-h-12 shrink-0 rounded-none first:border-b-2 first:border-primary">
              {tab}
            </button>
          ))}
        </div>
      </nav>
