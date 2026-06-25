import ajaxRequest from "./ajaxService";

import {
    getAuthorizationHeaders,
} from "./userService";

export const createPost = async ({
    content,
    groupId = null,
}) => {
    const headers =
        await getAuthorizationHeaders();

    const requestData = {
        content,
    };

    if (groupId) {
        requestData.groupId =
            groupId;
    }

    const response =
        await ajaxRequest({
            endpoint: "/api/posts",
            method: "POST",
            data: requestData,
            headers,
        });

    return response.data.post;
};

export const getFeedPosts = async () => {
    const headers =
        await getAuthorizationHeaders();

    const response =
        await ajaxRequest({
            endpoint: "/api/posts/feed",
            method: "GET",
            headers,
        });

    return response.data.posts || [];
};

export const getGroupPosts = async (
    groupId
) => {
    const headers =
        await getAuthorizationHeaders();

    const response =
        await ajaxRequest({
            endpoint:
                `/api/posts/group/${encodeURIComponent(
                    groupId
                )}`,

            method: "GET",
            headers,
        });

    return response.data.posts || [];
};