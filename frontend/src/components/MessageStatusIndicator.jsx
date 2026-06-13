const MessageStatusIndicator = ({ message, recipient, language }) => {
  if (recipient.isGroup) {
    const seenCount = message.seenBy?.length || 0;
    const deliveredCount = message.deliveredTo?.length || 0;
    const label = seenCount
      ? (language === "vi" ? `Đã xem bởi ${seenCount} người` : `Seen by ${seenCount}`)
      : deliveredCount
        ? (language === "vi" ? `Đã nhận bởi ${deliveredCount} người` : `Delivered to ${deliveredCount}`)
        : (language === "vi" ? "Đã gửi" : "Sent");
    return (
      <div className="mt-1 text-right text-xs text-base-content/50">
        {label}
      </div>
    );
  }

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
