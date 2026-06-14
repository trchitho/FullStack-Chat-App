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
