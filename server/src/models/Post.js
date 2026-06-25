import mongoose from "mongoose";

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

        likes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
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