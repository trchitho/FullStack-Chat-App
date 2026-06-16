import { Globe2, Lock, MessageCircle, Send, Share2, ThumbsUp, Users, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useSocialStore } from "../store/useSocialStore";
import ReactionListModal from "./ReactionListModal";
import SharePostModal from "./SharePostModal";

const reactionOptions = [
  ["like", "👍"], ["love", "❤️"], ["haha", "😂"],
  ["wow", "😮"], ["sad", "😢"], ["angry", "😡"],
];

const formatPostTime = (value) => new Intl.DateTimeFormat("vi-VN", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour12: false,
}).format(new Date(value));

const audienceIcons = {
  public: Globe2,
  friends: Users,
  private: Lock,
};

const InlineReactionPicker = ({ onSelect }) => (
  <span className="group/reaction relative inline-flex">
    <button type="button" className="btn btn-ghost btn-xs">Bày tỏ cảm xúc</button>
    <span className="absolute bottom-full left-0 z-20 hidden gap-1 rounded-full border border-base-300 bg-base-100 p-1 shadow-xl group-hover/reaction:flex group-focus-within/reaction:flex">
      {reactionOptions.map(([type, emoji]) => (
        <button
          key={type}
          type="button"
          className="rounded-full p-1 text-lg hover:bg-base-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
          onClick={() => onSelect(type)}
          aria-label={`Bày tỏ ${type}`}
        >
          {emoji}
        </button>
      ))}
    </span>
  </span>
);

const ShareListModal = ({ open, shares, onClose }) => {
  useEffect(() => {
    if (!open) return undefined;
    const closeOnEscape = (event) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [onClose, open]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[175] flex items-center justify-center bg-black/60 p-3" onMouseDown={onClose}>
      <section role="dialog" aria-modal="true" aria-label="Danh sách chia sẻ" className="w-full max-w-md rounded-2xl bg-base-100 shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
        <header className="flex items-center justify-between border-b border-base-300 p-4">
          <h2 className="text-lg font-bold">Lượt chia sẻ</h2>
          <button type="button" className="btn btn-circle btn-ghost btn-sm" onClick={onClose} aria-label="Đóng">
            <X className="size-5" />
          </button>
        </header>
        <div className="max-h-[60dvh] overflow-y-auto p-2">
          {shares.map((share) => (
            <div key={share._id} className="flex items-center gap-3 rounded-xl p-3 hover:bg-base-200">
              <img src={share.author?.profilePic || "/avatar.png"} alt="" className="size-11 rounded-full object-cover" />
              <div className="min-w-0 flex-1">
                <div className="truncate font-semibold">{share.author?.fullName || "Người dùng PingMe"}</div>
                <time className="text-xs text-base-content/55">{formatPostTime(share.createdAt)}</time>
              </div>
            </div>
          ))}
          {shares.length === 0 && (
            <p className="p-8 text-center text-sm text-base-content/60">
              Chưa có ai chia sẻ bài viết này.
            </p>
          )}
        </div>
      </section>
    </div>
  );
};

const PostCard = ({ post }) => {
  const authUser = useAuthStore((state) => state.authUser);
  const {
    reactToPost,
    reactToComment,
    reactToReply,
    addComment,
    addReply,
    getCommentReactions,
    getPostReactions,
    getPostShares,
    getReplyReactions,
  } = useSocialStore();
  const [comment, setComment] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [reply, setReply] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showShares, setShowShares] = useState(false);
  const [reactionUsers, setReactionUsers] = useState([]);
  const [shareUsers, setShareUsers] = useState([]);
  const AudienceIcon = audienceIcons[post.audience] || Users;

  useEffect(() => {
    if (!showComments) return undefined;
    const closeOnEscape = (event) => event.key === "Escape" && setShowComments(false);
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [showComments]);
  const ownReaction = post.reactions?.find((item) =>
    String(item.user?._id || item.user) === authUser._id
  )?.type;
  const openReactionList = async (loader) => {
    setReactionUsers(await loader());
    setShowReactions(true);
  };
  const openShareList = async () => {
    setShareUsers(await getPostShares(post._id));
    setShowShares(true);
  };

  return (
    <article className="overflow-hidden rounded-xl border border-base-300 bg-base-100 shadow-sm">
      <header className="flex items-center gap-3 p-4">
        <img src={post.author.profilePic || "/avatar.png"} alt="" className="size-11 rounded-full object-cover" />
        <div className="min-w-0 flex-1">
          <div className="truncate font-bold">{post.author.fullName}</div>
          <div className="flex items-center gap-1.5 text-sm text-base-content/55">
            <time>{formatPostTime(post.createdAt)}</time>
            <AudienceIcon className="size-3.5" aria-label={post.audience} />
          </div>
        </div>
      </header>
      {post.content && <p className="whitespace-pre-wrap break-words px-4 pb-4">{post.content}</p>}
      {post.originalPost && (
        <div className="mx-4 mb-4 overflow-hidden rounded-xl border border-base-300">
          {!!post.originalPost.media?.[0] && (
            <img
              src={post.originalPost.media[0].url}
              alt="Nội dung bài viết được chia sẻ"
              className="max-h-72 w-full object-cover"
            />
          )}
          <div className="p-3">
            <div className="font-bold">{post.originalPost.author?.fullName}</div>
            <p className="mt-1 line-clamp-4 whitespace-pre-wrap text-sm">
              {post.originalPost.content || "Bài viết đa phương tiện"}
            </p>
          </div>
        </div>
      )}
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
        <button type="button" className="hover:underline" onClick={() => openReactionList(() => getPostReactions(post._id))}>
          {post.reactions?.length || 0} lượt bày tỏ cảm xúc
        </button>
        <div className="flex gap-3">
          <button type="button" className="hover:underline" onClick={() => setShowComments(true)}>
            {post.comments?.length || 0} bình luận
          </button>
          <button type="button" className="hover:underline" onClick={openShareList}>
            {post.shareCount || 0} lượt chia sẻ
          </button>
        </div>
      </div>
      <div className="group relative grid grid-cols-3 border-b border-base-300 p-1">
        <button
          type="button"
          className={`btn btn-ghost min-h-11 ${ownReaction ? "text-primary" : ""}`}
          onClick={() => reactToPost(post._id, ownReaction ? null : "like")}
        >
          <ThumbsUp className="size-5" /> {ownReaction || "Thích"}
        </button>
        <button type="button" className="btn btn-ghost min-h-11" onClick={() => setShowComments(true)}>
          <MessageCircle className="size-5" /> Bình luận
        </button>
        <button type="button" className="btn btn-ghost min-h-11" onClick={() => setShowShare(true)}>
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
      {showComments && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center bg-black/60 p-3" onMouseDown={() => setShowComments(false)}>
          <section
            role="dialog"
            aria-modal="true"
            aria-label="Bình luận bài viết"
            className="flex max-h-[calc(100dvh-24px)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-base-100 shadow-2xl"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header className="flex shrink-0 items-center justify-between border-b border-base-300 p-4">
              <h2 className="text-lg font-bold">Bình luận bài viết</h2>
              <button type="button" className="btn btn-circle btn-ghost btn-sm" onClick={() => setShowComments(false)} aria-label="Đóng">
                <X className="size-5" />
              </button>
            </header>
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
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
              <InlineReactionPicker
                onSelect={(type) => reactToComment(post._id, item._id, type)}
              />
              {!!item.reactions?.length && (
                <button
                  type="button"
                  className="ml-1 text-xs text-base-content/60 hover:underline"
                  onClick={() => openReactionList(() => getCommentReactions(post._id, item._id))}
                >
                  {item.reactions.length} cảm xúc
                </button>
              )}
              {item.replies?.map((replyItem) => (
                <div key={replyItem._id} className="ml-4 mt-2 flex gap-2">
                  <img src={replyItem.author?.profilePic || "/avatar.png"} alt="" className="size-7 rounded-full object-cover" />
                  <div className="rounded-2xl bg-base-200 px-3 py-2 text-sm">
                    <div className="font-bold">{replyItem.author?.fullName}</div>
                    <p>{replyItem.content}</p>
                    <InlineReactionPicker
                      onSelect={(type) => reactToReply(
                        post._id,
                        item._id,
                        replyItem._id,
                        type
                      )}
                    />
                    {!!replyItem.reactions?.length && (
                      <button
                        type="button"
                        className="ml-1 text-xs text-base-content/60 hover:underline"
                        onClick={() => openReactionList(() => getReplyReactions(post._id, item._id, replyItem._id))}
                      >
                        {replyItem.reactions.length} cảm xúc
                      </button>
                    )}
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
          </section>
        </div>
      )}
      <ReactionListModal
        open={showReactions}
        reactions={reactionUsers}
        onClose={() => setShowReactions(false)}
      />
      <SharePostModal
        post={post}
        open={showShare}
        onClose={() => setShowShare(false)}
      />
      <ShareListModal
        open={showShares}
        shares={shareUsers}
        onClose={() => setShowShares(false)}
      />
    </article>
  );
};

export default PostCard;
