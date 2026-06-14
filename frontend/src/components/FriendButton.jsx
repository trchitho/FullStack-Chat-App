import { Check, UserMinus, UserPlus } from "lucide-react";
import { useSocialStore } from "../store/useSocialStore";

const FriendButton = ({ profile }) => {
  const { relationship, sendFriendRequest, removeFriendship } = useSocialStore();
  if (profile.isOwner) return null;

  if (relationship.status === "accepted") {
    return (
      <button
        type="button"
        className="btn btn-secondary min-h-11"
        onClick={() => removeFriendship(profile._id)}
      >
        <UserMinus className="size-5" />
        Hủy kết bạn
      </button>
    );
  }

  if (relationship.status === "pending") {
    return (
      <button type="button" className="btn min-h-11" disabled>
        <Check className="size-5" />
        {relationship.direction === "outgoing" ? "Đã gửi lời mời" : "Đang chờ phản hồi"}
      </button>
    );
  }

  return (
    <button
      type="button"
      className="btn btn-primary min-h-11"
      onClick={() => sendFriendRequest(profile._id)}
    >
      <UserPlus className="size-5" />
      Thêm bạn bè
    </button>
  );
};

export default FriendButton;
