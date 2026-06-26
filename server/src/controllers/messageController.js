import Message from "../models/Message.js";

import User from "../models/User.js";

export const getMyConversations = async (
    req,
    res,
    next
) => {
    try {
        const currentUserId =
            req.user._id.toString();

        const messages =
            await Message.find({
                $or: [
                    {
                        sender:
                            req.user._id,
                    },
                    {
                        recipient:
                            req.user._id,
                    },
                ],
            })
                .populate(
                    "sender",
                    "username displayName avatarUrl"
                )
                .populate(
                    "recipient",
                    "username displayName avatarUrl"
                )
                .sort({
                    createdAt: -1,
                })
                .limit(500);

        const conversationsByUser =
            new Map();

        for (const message of messages) {
            if (
                !message.sender ||
                !message.recipient
            ) {
                continue;
            }

            const senderId =
                message.sender._id.toString();

            const recipientId =
                message.recipient._id.toString();

            const otherUser =
                senderId === currentUserId
                    ? message.recipient
                    : message.sender;

            const otherUserId =
                otherUser._id.toString();

            if (
                !conversationsByUser.has(
                    otherUserId
                )
            ) {
                conversationsByUser.set(
                    otherUserId,
                    {
                        user: otherUser,
                        latestMessage:
                            message,
                        unreadCount: 0,
                    }
                );
            }

            if (
                recipientId ===
                    currentUserId &&
                !message.isRead
            ) {
                const conversation =
                    conversationsByUser.get(
                        otherUserId
                    );

                conversation.unreadCount +=
                    1;
            }
        }

        const conversations =
            Array.from(
                conversationsByUser.values()
            );

        return res.status(200).json({
            success: true,
            count:
                conversations.length,

            data: {
                conversations,
            },
        });
    } catch (error) {
        return next(error);
    }
};

export const getConversationMessages = async (
    req,
    res,
    next
) => {
    try {
        const username =
            req.params.username
                ?.trim()
                .toLowerCase();

        const otherUser =
            await User.findOne({
                username,
            }).select(
                "username displayName avatarUrl"
            );

        if (!otherUser) {
            const error = new Error(
                "User was not found"
            );

            error.statusCode = 404;
            throw error;
        }

        if (
            otherUser._id.toString() ===
            req.user._id.toString()
        ) {
            const error = new Error(
                "You cannot open a conversation with yourself"
            );

            error.statusCode = 400;
            throw error;
        }

        await Message.updateMany(
            {
                sender: otherUser._id,
                recipient: req.user._id,
                isRead: false,
            },
            {
                $set: {
                    isRead: true,
                },
            }
        );

        const messages =
            await Message.find({
                $or: [
                    {
                        sender: req.user._id,
                        recipient:
                            otherUser._id,
                    },
                    {
                        sender:
                            otherUser._id,
                        recipient:
                            req.user._id,
                    },
                ],
            })
                .populate(
                    "sender",
                    "username displayName avatarUrl"
                )
                .populate(
                    "recipient",
                    "username displayName avatarUrl"
                )
                .sort({
                    createdAt: 1,
                })
                .limit(200);

        return res.status(200).json({
            success: true,
            count: messages.length,

            data: {
                user: otherUser,
                messages,
            },
        });
    } catch (error) {
        return next(error);
    }
};

export const getUnreadMessageCount = async (
    req,
    res,
    next
) => {
    try {
        const unreadCount =
            await Message.countDocuments({
                recipient: req.user._id,
                isRead: false,
            });

        return res.status(200).json({
            success: true,
            unreadCount,
        });
    } catch (error) {
        return next(error);
    }
};