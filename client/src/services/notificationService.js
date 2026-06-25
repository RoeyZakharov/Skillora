import ajaxRequest from "./ajaxService";

import {
    getAuthorizationHeaders,
} from "./userService";

export const getMyNotifications =
    async () => {
        const headers =
            await getAuthorizationHeaders();

        const response =
            await ajaxRequest({
                endpoint:
                    "/api/notifications",
                method: "GET",
                headers,
            });

        return {
            notifications:
                response.data
                    .notifications,
            unreadCount:
                response.unreadCount ??
                0,
        };
    };

export const markMyNotificationsAsRead =
    async () => {
        const headers =
            await getAuthorizationHeaders();

        return ajaxRequest({
            endpoint:
                "/api/notifications/read",
            method: "PATCH",
            headers,
        });
    };