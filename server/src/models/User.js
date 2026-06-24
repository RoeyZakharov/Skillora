import mongoose from "mongoose";

const { Schema } = mongoose;

const userSchema = new Schema(
    {
        firebaseUid: {
            type: String,
            required: true,
            unique: true,
            index: true,
            immutable: true,
        },

        username: {
            type: String,
            required: true,
            unique: true,
            index: true,
            trim: true,
            lowercase: true,
            minlength: 3,
            maxlength: 30,
            match: [
                /^[a-z0-9_.]+$/,
                "Username may contain letters, numbers, underscores and dots only",
            ],
        },

        email: {
            type: String,
            required: true,
            unique: true,
            index: true,
            trim: true,
            lowercase: true,
            immutable: true,
        },

        displayName: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 60,
        },

        bio: {
            type: String,
            trim: true,
            maxlength: 500,
            default: "",
        },

        city: {
            type: String,
            trim: true,
            maxlength: 80,
            default: "",
        },

        interests: [
            {
                type: String,
                trim: true,
                lowercase: true,
                maxlength: 50,
            },
        ],

        skillsOffered: [
            {
                type: String,
                trim: true,
                lowercase: true,
                maxlength: 50,
            },
        ],

        skillsWanted: [
            {
                type: String,
                trim: true,
                lowercase: true,
                maxlength: 50,
            },
        ],

        avatarUrl: {
            type: String,
            trim: true,
            maxlength: 500,
            default: "",
        },

        friends: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
            },
        ],
    },
    {
        timestamps: true,
    }
);

userSchema.index({
    city: 1,
});

userSchema.index({
    interests: 1,
});

const User =
    mongoose.models.User ||
    mongoose.model("User", userSchema);

export default User;