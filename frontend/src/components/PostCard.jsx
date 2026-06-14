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
      {!!post.media?.length && (
        <div className={`grid gap-1 ${post.media.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
          {post.media.map((media, index) => (
            media.type === "video" ? (
              <video
                key={media.key || media.url}
                src={media.url}
                controls
                className={`max-h-[36rem] w-full bg-black object-contain ${post.media.length === 3 && index === 0 ? "row-span-2 h-full" : ""}`}
              />
            ) : (
              <img
                key={media.key || media.url}
                src={media.url}
                alt="Nội dung bài viết"
                className={`max-h-[36rem] w-full object-cover ${post.media.length === 3 && index === 0 ? "row-span-2 h-full" : ""}`}
              />
            )
          ))}
        </div>
      )}
      <div className="flex items-center justify-between border-b border-base-300 px-4 py-3 text-sm text-base-content/60">
        <span>{post.reactions?.length || 0} lượt bày tỏ cảm xúc</span>
        <span>{post.comments?.length || 0} bình luận</span>
      </div>
      <div className="group relative grid grid-cols-3 border-b border-base-300 p-1">
        <button
          type="button"
          className={`btn btn-ghost min-h-11 ${ownReaction ? "text-primary" : ""}`}
          onClick={() => reactToPost(post._id, ownReaction ? null : "like")}
        >
          <ThumbsUp className="size-5" /> {ownReaction || "Thích"}
        </button>
        <button type="button" className="btn btn-ghost min-h-11">
          <MessageCircle className="size-5" /> Bình luận
        </button>
        <button type="button" className="btn btn-ghost min-h-11">
          <Share2 className="size-5" /> Chia sẻ
        </button>
        <div className="absolute bottom-full left-2 hidden gap-1 rounded-full border border-base-300 bg-base-100 p-1 shadow-xl group-hover:flex group-focus-within:flex">
          {reactionOptions.map(([type, emoji]) => (
            <button key={type} type="button" className="rounded-full p-2 text-xl hover:bg-base-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary" onClick={() => reactToPost(post._id, type)} aria-label={`Bày tỏ ${type}`}>
              {emoji}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-3 p-4">
        {post.comments?.map((item) => (
          <div key={item._id} className="flex gap-2">
            <img src={item.author?.profilePic || "/avatar.png"} alt="" className="size-9 rounded-full object-cover" />
            <div className="min-w-0 flex-1">
              <div className="rounded-2xl bg-base-200 px-3 py-2">
                <div className="font-bold">{item.author?.fullName}</div>
                <p className="break-words">{item.content}</p>
              </div>
              <button type="button" className="btn btn-ghost btn-xs mt-1" onClick={() => setReplyingTo(item._id)}>
                Trả lời
              </button>
              {item.replies?.map((replyItem) => (
                <div key={replyItem._id} className="ml-4 mt-2 flex gap-2">
                  <img src={replyItem.author?.profilePic || "/avatar.png"} alt="" className="size-7 rounded-full object-cover" />
                  <div className="rounded-2xl bg-base-200 px-3 py-2 text-sm">
                    <div className="font-bold">{replyItem.author?.fullName}</div>
                    <p>{replyItem.content}</p>
                  </div>
                </div>
              ))}
              {replyingTo === item._id && (
                <form
                  className="mt-2 flex gap-2"
                  onSubmit={async (event) => {
                    event.preventDefault();
                    if (!reply.trim()) return;
                    await addReply(post._id, item._id, reply.trim());
                    setReply("");
                    setReplyingTo(null);
                  }}
                >
                  <input className="input input-bordered input-sm min-w-0 flex-1 rounded-full" value={reply} onChange={(event) => setReply(event.target.value)} aria-label="Nội dung trả lời" autoFocus />
                  <button type="submit" className="btn btn-circle btn-primary btn-sm" aria-label="Gửi trả lời">
                    <Send className="size-4" />
                  </button>
                </form>
              )}
            </div>
          </div>
        ))}
        <form
          className="flex items-center gap-2"
          onSubmit={async (event) => {
            event.preventDefault();
            if (!comment.trim()) return;
            await addComment(post._id, comment.trim());
            setComment("");
          }}
        >
          <img src={authUser.profilePic || "/avatar.png"} alt="" className="size-9 rounded-full object-cover" />
          <input
            className="input input-bordered min-w-0 flex-1 rounded-full"
            placeholder="Viết bình luận..."
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            aria-label="Viết bình luận"
          />
          <button type="submit" className="btn btn-circle btn-primary" aria-label="Gửi bình luận" disabled={!comment.trim()}>
            <Send className="size-5" />
          </button>
        </form>
      </div>
    </article>
  );
};

export default PostCard;
