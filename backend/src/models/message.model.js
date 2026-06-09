import mongoose from 'mongoose';

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
        attachment: {
            url: String,
            key: String,
            name: String,
            type: String,
            size: Number,
        },
        replyTo: {
            messageId: String,
            senderName: String,
            preview: String,
        }
    },
    {timestamps: true}
)

const Message = mongoose.model('Message', messageSchema);

export default Message;
