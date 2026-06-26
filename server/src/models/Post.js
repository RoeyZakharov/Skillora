import mongoose from "mongoose";

const commentSchema =
    new mongoose.Schema(
        {
            author: {
                type:
                    mongoose.Schema.Types
                        .ObjectId,
                ref: "User",
                required: true,
            },

            content: {
                type: String,
                required: true,
                trim: true,
                minlength: 1,
                maxlength: 1000,
            },
        },
        {
            timestamps: true,
        }
    );

const attachmentSchema =
    new mongoose.Schema(
        {
            type: {
                type: String,
                enum: [
                    "image",
                    "video",
                    "canvas",
                ],
                required: true,
            },

            url: {
                type: String,
                trim: true,
                default: "",
            },

            canvasData: {
                type:
                    mongoose.Schema.Types
                        .Mixed,
                default: null,
            },
        },
        {
            _id: true,
        }
    );

const postSchema = new mongoose.Schema(
    {
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        group: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Group",
            default: null,
            index: true,
        },

        content: {
            type: String,
            required: true,
            trim: true,
            minlength: 1,
            maxlength: 3000,
        },

        postType: {
            type: String,
            enum: [
                "text",
                "image",
                "video",
                "canvas",
                "mixed",
            ],
            default: "text",
        },

        mediaUrl: {
            type: String,
            trim: true,
            default: "",
        },

        canvasData: {
            type: mongoose.Schema.Types.Mixed,
            default: null,
        },

        attachments: {
            type: [attachmentSchema],
            default: [],
        },

        likes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        comments: {
            type: [commentSchema],
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

postSchema.index({
    content: "text",
});

postSchema.index({
    author: 1,
    createdAt: -1,
});

postSchema.index({
    group: 1,
    createdAt: -1,
});

const Post =
    mongoose.models.Post ||
    mongoose.model(
        "Post",
        postSchema
    );

export default Post;