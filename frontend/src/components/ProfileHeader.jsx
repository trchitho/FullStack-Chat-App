import { Camera, MessageCircle, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useChatStore } from "../store/useChatStore";
import FriendButton from "./FriendButton";

const ProfileHeader = ({ profile, onEdit, onEditMedia }) => {
  const navigate = useNavigate();
  const setSelectedUser = useChatStore((state) => state.setSelectedUser);
  const openChat = () => {
    setSelectedUser(profile);
    navigate("/");
  };

  return (
    <section className="border-b border-base-300 bg-base-100">
      <div className="relative mx-auto max-w-6xl">
        <div className="h-48 overflow-hidden bg-base-300 sm:h-64 lg:h-80">
          {profile.coverPhoto ? (
            <img src={profile.coverPhoto} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full bg-gradient-to-br from-primary/30 via-secondary/20 to-base-300" />
          )}
        </div>
        {profile.isOwner && (
          <label className="btn btn-sm absolute right-4 top-4 min-h-11 cursor-pointer bg-base-100">
            <Camera className="size-4" /> Sửa ảnh bìa
            <input type="file" accept="image/*" className="sr-only" onChange={(event) => onEditMedia("coverPhoto", event.target.files?.[0])} />
          </label>
        )}
        <div className="flex flex-col gap-4 px-4 pb-5 sm:flex-row sm:items-end sm:px-8">
          <div className="relative -mt-16 shrink-0">
            <img
              src={profile.profilePic || "/avatar.png"}
              alt={profile.fullName}
              className="size-32 rounded-full border-4 border-base-100 object-cover sm:size-40"
            />
            {profile.isOwner && (
              <label className="btn btn-circle btn-sm absolute bottom-2 right-1 cursor-pointer" aria-label="Đổi ảnh đại diện">
                <Camera className="size-4" />
                <input type="file" accept="image/*" className="sr-only" onChange={(event) => onEditMedia("profilePic", event.target.files?.[0])} />
              </label>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="break-words text-3xl font-bold sm:text-4xl">{profile.fullName}</h1>
            <p className="mt-1 text-base-content/65">{profile.friendCount || 0} người bạn</p>
            {profile.bio && <p className="mt-2 max-w-2xl">{profile.bio}</p>}
          </div>
          <div className="flex flex-wrap gap-2">
            {profile.isOwner ? (
              <button type="button" className="btn btn-primary min-h-11" onClick={onEdit}>
                <Pencil className="size-5" /> Chỉnh sửa trang cá nhân
              </button>
            ) : (
              <>
                <FriendButton profile={profile} />
                <button type="button" className="btn min-h-11" onClick={openChat}>
                  <MessageCircle className="size-5" /> Nhắn tin
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProfileHeader;
