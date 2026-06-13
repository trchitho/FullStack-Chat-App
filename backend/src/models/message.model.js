import mongoose from 'mongoose';

const attachmentSchema = new mongoose.Schema(
    {
        url: String,
        key: String,
        name: String,
        type: String,
        size: Number,
        storage: String,
    },
    { _id: false }
);

const callSchema = new mongoose.Schema(
    {
        type: String,
        status: String,
        duration: Number,
    },
    { _id: false }
);

const receiptSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        at: { type: Date, default: Date.now },
    },
    { _id: false }
);

const messageSchema = new mongoose.Schema(
    {
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        receiverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        text: {
            type: String,
        },
        image: {
            type: String,
        },
        attachment: attachmentSchema,
        replyTo: {
            messageId: String,
            senderName: String,
            preview: String,
        },
        call: callSchema,
        deliveredTo: { type: [receiptSchema], default: [] },
        seenBy: { type: [receiptSchema], default: [] },
    },
    {timestamps: true}
)

const Message = mongoose.model('Message', messageSchema);

export default Message;
