import mongoose from "mongoose";

const notificationSchema =
    new mongoose.Schema(
        {
            recipient: {
                type:
                    mongoose.Schema.Types
                        .ObjectId,
                ref: "User",
                required: true,
                index: true,
            },

            actor: {
                type:
                    mongoose.Schema.Types
                        .ObjectId,
                ref: "User",
                required: true,
            },

            type: {
                type: String,
                enum: [
                    "group_post_removed",
                    "post_liked",
                    "post_commented",
                    "group_join_request",
                    "group_join_approved",
                    "group_join_rejected",
                    "group_invitation",
                ],
                required: true,
            },

            group: {
                type:
                    mongoose.Schema.Types
                        .ObjectId,
                ref: "Group",
                default: null,
            },

            post: {
                type:
                    mongoose.Schema.Types
                        .ObjectId,
                ref: "Post",
                default: null,
            },

            message: {
                type: String,
                required: true,
                trim: true,
                maxlength: 500,
            },

            postExcerpt: {
                type: String,
                trim: true,
                maxlength: 300,
                default: "",
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

notificationSchema.index({
    recipient: 1,
    isRead: 1,
    createdAt: -1,
});

const Notification =
    mongoose.models.Notification ||
    mongoose.model(
        "Notification",
        notificationSchema
    );

export default Notification;