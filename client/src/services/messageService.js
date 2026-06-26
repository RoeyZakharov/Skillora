import ajaxRequest from "./ajaxService";

import {
    getSocket,
} from "./socketService";

import {
    getAuthorizationHeaders,
} from "./userService";

export const getMyConversations =
    async () => {
        const headers =
            await getAuthorizationHeaders();

        const response =
            await ajaxRequest({
                endpoint:
                    "/api/messages/conversations",
                method: "GET",
                headers,
            });

        return (
            response.data
                .conversations || []
        );
    };

export const getUnreadMessageCount =
    async () => {
        const headers =
            await getAuthorizationHeaders();

        const response =
            await ajaxRequest({
                endpoint:
                    "/api/messages/unread-count",
                method: "GET",
                headers,
            });

        return response.unreadCount ?? 0;
    };

export const getConversationMessages =
    async (username) => {
        const headers =
            await getAuthorizationHeaders();

        const response =
            await ajaxRequest({
                endpoint:
                    `/api/messages/conversation/${encodeURIComponent(
                        username
                    )}`,
                method: "GET",
                headers,
            });

        return {
            user: response.data.user,
            messages:
                response.data.messages || [],
        };
    };

export const sendMessage = async ({
    recipientUsername,
    content,
}) => {
    const socket = getSocket();

    if (!socket?.connected) {
        throw new Error(
            "Chat is not connected"
        );
    }

    return new Promise(
        (resolve, reject) => {
            socket.timeout(10000).emit(
                "send_message",
                {
                    recipientUsername,
                    content,
                },
                (
                    timeoutError,
                    response
                ) => {
                    if (timeoutError) {
                        reject(
                            new Error(
                                "The message request timed out"
                            )
                        );

                        return;
                    }

                    if (!response?.success) {
                        reject(
                            new Error(
                                response?.error ||
                                    "Could not send the message"
                            )
                        );

                        return;
                    }

                    resolve(
                        response.message
                    );
                }
            );
        }
    );
};