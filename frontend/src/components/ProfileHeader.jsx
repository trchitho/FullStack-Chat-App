import { Camera, MessageCircle, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useChatStore } from "../store/useChatStore";
import FriendButton from "./FriendButton";

const ProfileHeader = ({ profile, onEditMedia }) => {
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
