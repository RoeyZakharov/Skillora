import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        sender: {
            type:
                mongoose.Schema.Types
                    .ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        recipient: {
            type:
                mongoose.Schema.Types
                    .ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        content: {
            type: String,
            required: true,
            trim: true,
            minlength: 1,
            maxlength: 2000,
        },

        isRead: {
            type: Boolean,
            default: false,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

messageSchema.index({
    sender: 1,
    recipient: 1,
    createdAt: -1,
});

messageSchema.index({
    recipient: 1,
    isRead: 1,
    createdAt: -1,
});

const Message =
    mongoose.models.Message ||
    mongoose.model(
        "Message",
        messageSchema
    );

export default Message;