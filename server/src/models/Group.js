import mongoose from "mongoose";

const { Schema } = mongoose;

const groupMemberSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        role: {
            type: String,
            enum: ["member", "manager"],
            default: "member",
        },

        status: {
            type: String,
            enum: [
                "invited",
                "pending",
                "approved",
                "rejected",
            ],
            default: "pending",
        },

        requestedAt: {
            type: Date,
            default: Date.now,
        },

        joinedAt: {
            type: Date,
            default: null,
        },

        invitedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        invitedAt: {
            type: Date,
            default: null,
        },
    },
    {
        _id: false,
    }
);

const groupSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 3,
            maxlength: 80,
        },

        description: {
            type: String,
            required: true,
            trim: true,
            minlength: 10,
            maxlength: 1000,
        },

        category: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            minlength: 2,
            maxlength: 50,
            index: true,
        },

        city: {
            type: String,
            trim: true,
            maxlength: 80,
            default: "",
            index: true,
        },

        isOnline: {
            type: Boolean,
            required: true,
            default: false,
            index: true,
        },

        privacy: {
            type: String,
            enum: ["public", "private"],
            default: "public",
            index: true,
        },

        tags: [
            {
                type: String,
                trim: true,
                lowercase: true,
                maxlength: 40,
            },
        ],

        admin: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        members: {
            type: [groupMemberSchema],
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

groupSchema.index({
    name: "text",
    description: "text",
    tags: "text",
});

const Group =
    mongoose.models.Group ||
    mongoose.model("Group", groupSchema);

export default Group;