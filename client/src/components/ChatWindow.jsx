"use client";

import {
    useEffect,
    useRef,
    useState,
} from "react";

import {
    getConversationMessages,
    getMyConversations,
    sendMessage,
} from "../services/messageService";

import {
    getSocket,
} from "../services/socketService";

const getUserInitials = (user) => {
    const name =
        user?.displayName ||
        user?.username ||
        "Skillora User";

    return name
        .split(/\s+/)
        .slice(0, 2)
        .map((part) =>
            part.charAt(0).toUpperCase()
        )
        .join("");
};

const formatMessageTime = (createdAt) => {
    if (!createdAt) {
        return "";
    }

    return new Intl.DateTimeFormat(
        "en-US",
        {
            hour: "2-digit",
            minute: "2-digit",
        }
    ).format(new Date(createdAt));
};

export default function ChatWindow() {
    const [
        conversations,
        setConversations,
    ] = useState([]);

    const [
        selectedUser,
        setSelectedUser,
    ] = useState(null);

    const [
        newChatUsername,
        setNewChatUsername,
    ] = useState("");

    const [messages, setMessages] =
        useState([]);

    const [content, setContent] =
        useState("");

    const [isLoading, setIsLoading] =
        useState(true);

    const [isSending, setIsSending] =
        useState(false);

    const [error, setError] =
        useState("");

    const selectedUserRef =
        useRef(null);

    const messagesEndRef =
        useRef(null);

    useEffect(() => {
        selectedUserRef.current =
            selectedUser;
    }, [selectedUser]);

    useEffect(() => {
        messagesEndRef.current
            ?.scrollIntoView({
                behavior: "smooth",
            });
    }, [messages]);

    const openConversation = async (
        username
    ) => {
        setError("");

        try {
            const result =
                await getConversationMessages(
                    username
                );

            setSelectedUser(result.user);
            setMessages(result.messages);

            setConversations(
                (currentConversations) => {
                    const existingConversation =
                        currentConversations.find(
                            (conversation) =>
                                conversation.user
                                    .username ===
                                result.user.username
                        );

                    const latestMessage =
                        result.messages[
                            result.messages.length - 1
                        ] ||
                        existingConversation?.latestMessage ||
                        null;

                    const openedConversation = {
                        user: result.user,
                        latestMessage,
                        unreadCount: 0,
                    };

                    return [
                        openedConversation,
                        ...currentConversations.filter(
                            (conversation) =>
                                conversation.user
                                    .username !==
                                result.user.username
                        ),
                    ];
                }
            );
        } catch (loadError) {
            setError(
                loadError.message ||
                    "Could not load the conversation."
            );
        }
    };

    useEffect(() => {
        let isCancelled = false;

        const loadConversations =
            async () => {
                try {
                    const loadedConversations =
                        await getMyConversations();

                    if (isCancelled) {
                        return;
                    }

                    setConversations(
                        loadedConversations
                    );

                    if (
                        loadedConversations.length >
                        0
                    ) {
                        const firstUsername =
                            loadedConversations[0]
                                .user.username;

                        const result =
                            await getConversationMessages(
                                firstUsername
                            );

                        if (isCancelled) {
                            return;
                        }

                        setSelectedUser(
                            result.user
                        );

                        setMessages(
                            result.messages
                        );

                        window.dispatchEvent(
                            new CustomEvent(
                                "skillora-messages-read"
                            )
                        );
                    }
                } catch (loadError) {
                    if (!isCancelled) {
                        setError(
                            loadError.message ||
                                "Could not load conversations."
                        );
                    }
                } finally {
                    if (!isCancelled) {
                        setIsLoading(false);
                    }
                }
            };

        loadConversations();

        return () => {
            isCancelled = true;
        };
    }, []);

    useEffect(() => {
        const socket = getSocket();

        if (!socket) {
            return;
        }

        const handleIncomingMessage = (
            message
        ) => {
            const senderUsername =
                message.sender?.username;

            if (!senderUsername) {
                return;
            }

            const currentSelectedUser =
                selectedUserRef.current;

            if (
                currentSelectedUser
                    ?.username ===
                senderUsername
            ) {
                setMessages(
                    (currentMessages) => [
                        ...currentMessages,
                        message,
                    ]
                );
            }

            setConversations(
                (currentConversations) => {
                    const existingConversation =
                        currentConversations.find(
                            (conversation) =>
                                conversation.user
                                    .username ===
                                senderUsername
                        );

                    const updatedConversation = {
                        user: message.sender,
                        latestMessage: message,
                        unreadCount:
                            currentSelectedUser
                                ?.username ===
                            senderUsername
                                ? 0
                                : (existingConversation
                                      ?.unreadCount ||
                                      0) + 1,
                    };

                    return [
                        updatedConversation,
                        ...currentConversations.filter(
                            (conversation) =>
                                conversation.user
                                    .username !==
                                senderUsername
                        ),
                    ];
                }
            );
        };

        socket.on(
            "receive_message",
            handleIncomingMessage
        );

        return () => {
            socket.off(
                "receive_message",
                handleIncomingMessage
            );
        };
    }, []);

    const handleStartConversation =
        async (event) => {
            event.preventDefault();

            const username =
                newChatUsername
                    .trim()
                    .toLowerCase();

            if (!username) {
                setError(
                    "Enter a username."
                );

                return;
            }

            await openConversation(username);
            setNewChatUsername("");
        };

    const handleSubmit = async (
        event
    ) => {
        event.preventDefault();

        const normalizedContent =
            content.trim();

        if (!selectedUser) {
            setError(
                "Select a conversation first."
            );

            return;
        }

        if (!normalizedContent) {
            setError("Enter a message.");
            return;
        }

        setIsSending(true);
        setError("");

        try {
            const message =
                await sendMessage({
                    recipientUsername:
                        selectedUser.username,
                    content:
                        normalizedContent,
                });

            setMessages(
                (currentMessages) => [
                    ...currentMessages,
                    message,
                ]
            );

            setConversations(
                (currentConversations) => {
                    const updatedConversation = {
                        user: selectedUser,
                        latestMessage: message,
                        unreadCount: 0,
                    };

                    return [
                        updatedConversation,
                        ...currentConversations.filter(
                            (conversation) =>
                                conversation.user
                                    .username !==
                                selectedUser.username
                        ),
                    ];
                }
            );

            setContent("");
        } catch (sendError) {
            setError(
                sendError.message ||
                    "Could not send the message."
            );
        } finally {
            setIsSending(false);
        }
    };

    return (
        <section className="skillora-messenger">
            <aside className="skillora-messenger-sidebar">
                <header className="skillora-messenger-sidebar-header">
                    <h2>Chats</h2>

                    <form
                        className="skillora-chat-recipient"
                        onSubmit={
                            handleStartConversation
                        }
                    >
                        <div className="skillora-chat-recipient-search">
                            <input
                                id="chat-recipient"
                                type="text"
                                value={
                                    newChatUsername
                                }
                                onChange={(
                                    event
                                ) => {
                                    setNewChatUsername(
                                        event.target
                                            .value
                                    );

                                    setError("");
                                }}
                                placeholder="Search by username"
                            />

                            <button
                                type="submit"
                                disabled={
                                    !newChatUsername.trim()
                                }
                            >
                                Open
                            </button>
                        </div>
                    </form>
                </header>

                <div className="skillora-conversation-list">
                    {isLoading ? (
                        <p>
                            Loading chats...
                        </p>
                    ) : conversations.length ===
                      0 ? (
                        <p>
                            No conversations yet.
                        </p>
                    ) : (
                        conversations.map(
                            (conversation) => {
                                const user =
                                    conversation.user;

                                const isSelected =
                                    selectedUser
                                        ?.username ===
                                    user.username;

                                return (
                                    <button
                                        key={
                                            user._id
                                        }
                                        type="button"
                                        className={
                                            isSelected
                                                ? "skillora-conversation-item skillora-conversation-item-active"
                                                : "skillora-conversation-item"
                                        }
                                        onClick={() =>
                                            openConversation(
                                                user.username
                                            )
                                        }
                                    >
                                        <span className="skillora-chat-avatar">
                                            {user.avatarUrl ? (
                                                <img
                                                    src={
                                                        user.avatarUrl
                                                    }
                                                    alt=""
                                                />
                                            ) : (
                                                getUserInitials(
                                                    user
                                                )
                                            )}
                                        </span>

                                        <span className="skillora-conversation-details">
                                            <strong>
                                                {user.displayName ||
                                                    user.username}
                                            </strong>

                                            <small>
                                                {conversation
                                                    .latestMessage
                                                    ?.content ||
                                                    "Start a conversation"}
                                            </small>
                                        </span>

                                        {conversation.unreadCount >
                                            0 && (
                                            <span className="skillora-conversation-unread">
                                                {
                                                    conversation.unreadCount
                                                }
                                            </span>
                                        )}
                                    </button>
                                );
                            }
                        )
                    )}
                </div>
            </aside>

            <div className="skillora-messenger-conversation">
                {!selectedUser ? (
                    <div className="skillora-messenger-placeholder">
                        <h2>
                            Select a conversation
                        </h2>

                        <p>
                            Choose a chat from the
                            left or enter a username.
                        </p>
                    </div>
                ) : (
                    <>
                        <header className="skillora-messenger-conversation-header">
                            <span className="skillora-chat-avatar">
                                {selectedUser.avatarUrl ? (
                                    <img
                                        src={
                                            selectedUser.avatarUrl
                                        }
                                        alt=""
                                    />
                                ) : (
                                    getUserInitials(
                                        selectedUser
                                    )
                                )}
                            </span>

                            <div>
                                <strong>
                                    {selectedUser.displayName ||
                                        selectedUser.username}
                                </strong>

                                <span>
                                    @
                                    {
                                        selectedUser.username
                                    }
                                </span>
                            </div>
                        </header>

                        <div className="skillora-messenger-messages">
                            {messages.length === 0 ? (
                                <p className="skillora-chat-empty">
                                    No messages in this
                                    conversation yet.
                                </p>
                            ) : (
                                messages.map(
                                    (message) => {
                                        const isIncoming =
                                            message
                                                .sender
                                                ?.username ===
                                            selectedUser.username;

                                        return (
                                            <div
                                                key={
                                                    message._id
                                                }
                                                className={
                                                    isIncoming
                                                        ? "skillora-message-row skillora-message-row-incoming"
                                                        : "skillora-message-row skillora-message-row-outgoing"
                                                }
                                            >
                                                <div className="skillora-message-bubble">
                                                    <p>
                                                        {
                                                            message.content
                                                        }
                                                    </p>

                                                    <time
                                                        dateTime={
                                                            message.createdAt
                                                        }
                                                    >
                                                        {formatMessageTime(
                                                            message.createdAt
                                                        )}
                                                    </time>
                                                </div>
                                            </div>
                                        );
                                    }
                                )
                            )}

                            <div
                                ref={
                                    messagesEndRef
                                }
                            />
                        </div>

                        <form
                            className="skillora-messenger-composer"
                            onSubmit={
                                handleSubmit
                            }
                        >
                            <textarea
                                value={content}
                                onChange={(
                                    event
                                ) => {
                                    setContent(
                                        event.target
                                            .value
                                    );

                                    setError("");
                                }}
                                placeholder="Write a message..."
                                maxLength={2000}
                                rows={1}
                                disabled={
                                    isSending
                                }
                            />

                            <button
                                type="submit"
                                disabled={
                                    isSending ||
                                    !content.trim()
                                }
                            >
                                {isSending
                                    ? "Sending..."
                                    : "Send"}
                            </button>
                        </form>
                    </>
                )}

                {error && (
                    <p className="skillora-chat-error">
                        {error}
                    </p>
                )}
            </div>
        </section>
    );
}
