import User from "../models/User.js";

import Message from "../models/Message.js";

import {
    firebaseAuth,
} from "../middleware/authentication.js";

export const configureChatSocket = (
    io
) => {
    io.use(
        async (socket, next) => {
            try {
                const token =
                    socket.handshake.auth
                        ?.token;

                if (!token) {
                    return next(
                        new Error(
                            "Authentication token is missing"
                        )
                    );
                }

                const decodedToken =
                    await firebaseAuth.verifyIdToken(
                        token
                    );

                const user =
                    await User.findOne({
                        firebaseUid:
                            decodedToken.uid,
                    }).select(
                        "username displayName avatarUrl"
                    );

                if (!user) {
                    return next(
                        new Error(
                            "Skillora user was not found"
                        )
                    );
                }

                socket.user = {
                    id:
                        user._id.toString(),
                    username:
                        user.username,
                    displayName:
                        user.displayName,
                    avatarUrl:
                        user.avatarUrl,
                };

                return next();
            } catch (error) {
                console.error(
                    "Socket authentication failed:",
                    error.message
                );

                return next(
                    new Error(
                        "Invalid or expired authentication token"
                    )
                );
            }
        }
    );

    io.on(
        "connection",
        (socket) => {

            console.log(
                `Socket connected: ${socket.id}, user: ${socket.user.username}`
            );

            socket.join(
                `user:${socket.user.id}`
            );

            socket.on(
                "send_message",
                async (
                    payload = {},
                    acknowledge = () => {}
                ) => {
                    try {
                        const recipientUsername =
                            typeof payload.recipientUsername ===
                            "string"
                                ? payload.recipientUsername
                                    .trim()
                                    .toLowerCase()
                                : "";

                        const content =
                            typeof payload.content ===
                            "string"
                                ? payload.content.trim()
                                : "";

                        if (!recipientUsername) {
                            throw new Error(
                                "Recipient username is required"
                            );
                        }

                        if (!content) {
                            throw new Error(
                                "Message content is required"
                            );
                        }

                        if (content.length > 2000) {
                            throw new Error(
                                "Message cannot exceed 2000 characters"
                            );
                        }

                        const recipient =
                            await User.findOne({
                                username:
                                    recipientUsername,
                            }).select(
                                "username displayName avatarUrl"
                            );

                        if (!recipient) {
                            throw new Error(
                                "Recipient was not found"
                            );
                        }

                        if (
                            recipient._id.toString() ===
                            socket.user.id
                        ) {
                            throw new Error(
                                "You cannot send a message to yourself"
                            );
                        }

                        const message =
                            await Message.create({
                                sender:
                                    socket.user.id,
                                recipient:
                                    recipient._id,
                                content,
                                isRead: false,
                            });

                        await message.populate([
                            {
                                path: "sender",
                                select:
                                    "username displayName avatarUrl",
                            },
                            {
                                path: "recipient",
                                select:
                                    "username displayName avatarUrl",
                            },
                        ]);

                        const messageData =
                            message.toObject();

                        io.to(
                            `user:${recipient._id.toString()}`
                        ).emit(
                            "receive_message",
                            messageData
                        );

                        acknowledge({
                            success: true,
                            message: messageData,
                        });
                    } catch (error) {
                        console.error(
                            "Could not send message:",
                            error.message
                        );

                        acknowledge({
                            success: false,
                            error:
                                error.message ||
                                "Could not send message",
                        });
                    }
                }
            );

            socket.on(
                "disconnect",
                () => {
                    console.log(
                        `Socket disconnected: ${socket.id}`
                    );
                }
            );
        }
    );
};