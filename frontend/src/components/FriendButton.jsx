import { Check, UserMinus, UserPlus } from "lucide-react";
import { useSocialStore } from "../store/useSocialStore";

const FriendButton = ({ profile }) => {
  const {
    relationship, sendFriendRequest, removeFriendship, respondToFriendRequest,
  } = useSocialStore();
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
    if (relationship.direction === "incoming") {
      return (
        <button type="button" className="btn btn-primary min-h-11" onClick={() => respondToFriendRequest(relationship._id, "accept")}>
          <Check className="size-5" />
          Chấp nhận lời mời
        </button>
      );
    }
    return (
      <button type="button" className="btn min-h-11" disabled>
        <Check className="size-5" />
        Đã gửi lời mời
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
