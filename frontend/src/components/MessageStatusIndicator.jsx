const MessageStatusIndicator = ({ message, recipient, language }) => {
  const isSeen = message.seenBy?.some((receipt) => String(receipt.user?._id || receipt.user) === recipient._id);
  const isDelivered = message.deliveredTo?.some((receipt) => String(receipt.user?._id || receipt.user) === recipient._id);

  if (isSeen) {
    return (
      <div className="mt-1 flex justify-end">
        <img
          src={recipient.profilePic || "/avatar.png"}
          alt={language === "vi" ? `Đã xem bởi ${recipient.fullName}` : `Seen by ${recipient.fullName}`}
          title={language === "vi" ? "Đã xem" : "Seen"}
          className="size-4 rounded-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className="mt-1 text-right text-xs text-base-content/50">
      {isDelivered
        ? (language === "vi" ? "Đã nhận" : "Delivered")
        : (language === "vi" ? "Đã gửi" : "Sent")}
    </div>
  );
};

export default MessageStatusIndicator;
