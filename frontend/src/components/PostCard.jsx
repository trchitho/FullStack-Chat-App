import { MessageCircle, Send, Share2, ThumbsUp } from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useSocialStore } from "../store/useSocialStore";

const reactionOptions = [
  ["like", "👍"], ["love", "❤️"], ["haha", "😂"],
  ["wow", "😮"], ["sad", "😢"], ["angry", "😡"],
];

const PostCard = ({ post }) => {
  const authUser = useAuthStore((state) => state.authUser);
  const { reactToPost, addComment, addReply } = useSocialStore();
  const [comment, setComment] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [reply, setReply] = useState("");
  const ownReaction = post.reactions?.find((item) =>
    String(item.user?._id || item.user) === authUser._id
  )?.type;

  return (
    <article className="overflow-hidden rounded-xl border border-base-300 bg-base-100 shadow-sm">
      <header className="flex items-center gap-3 p-4">
        <img src={post.author.profilePic || "/avatar.png"} alt="" className="size-11 rounded-full object-cover" />
        <div className="min-w-0 flex-1">
          <div className="truncate font-bold">{post.author.fullName}</div>
          <time className="text-sm text-base-content/55">{new Date(post.createdAt).toLocaleString("vi-VN")}</time>
        </div>
      </header>
      {post.content && <p className="whitespace-pre-wrap break-words px-4 pb-4">{post.content}</p>}
