import ajaxRequest from "./ajaxService";

import {
    getAuthorizationHeaders,
} from "./userService";

export const createPost = async ({
    content,
    groupId = null,
    postType = "text",
    mediaUrl = "",
    canvasData = null,
    attachments = [],
}) => {
    const headers =
        await getAuthorizationHeaders();

    const response =
        await ajaxRequest({
            endpoint: "/api/posts",
            method: "POST",
            data: {
                content,
                groupId,
                postType,
                mediaUrl,
                canvasData,
                attachments,
            },
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

export const updatePost = async (
    postId,
    content
) => {
    const headers =
        await getAuthorizationHeaders();

    const response =
        await ajaxRequest({
            endpoint:
                `/api/posts/${encodeURIComponent(
                    postId
                )}`,
            method: "PATCH",
            data: {
                content,
            },
            headers,
        });

    return response.data.post;
};

export const deletePost = async (
    postId
) => {
    const headers =
        await getAuthorizationHeaders();

    return ajaxRequest({
        endpoint:
            `/api/posts/${encodeURIComponent(
                postId
            )}`,
        method: "DELETE",
        headers,
    });
};

export const togglePostLike = async (
    postId
) => {
    const headers =
        await getAuthorizationHeaders();

    const response =
        await ajaxRequest({
            endpoint:
                `/api/posts/${encodeURIComponent(
                    postId
                )}/like`,

            method: "PATCH",
            headers,
        });

    return response.data.post;
};

export const addPostComment = async (
    postId,
    content
) => {
    const headers =
        await getAuthorizationHeaders();

    const response =
        await ajaxRequest({
            endpoint:
                `/api/posts/${encodeURIComponent(
                    postId
                )}/comments`,
            method: "POST",
            data: {
                content,
            },
            headers,
        });

    return response.data.post;
};

export const deletePostComment = async (
    postId,
    commentId
) => {
    const headers =
        await getAuthorizationHeaders();

    const response =
        await ajaxRequest({
            endpoint:
                `/api/posts/${encodeURIComponent(
                    postId
                )}/comments/${encodeURIComponent(
                    commentId
                )}`,
            method: "DELETE",
            headers,
        });

    return response.data.post;
};

export const uploadPostVideo = async (
    videoFile
) => {
    const headers =
        await getAuthorizationHeaders();

    const formData = new FormData();

    formData.append(
        "video",
        videoFile
    );

    const response =
        await ajaxRequest({
            endpoint:
                "/api/posts/upload-video",
            method: "POST",
            data: formData,
            headers,
        });

    return response.data.videoUrl;
};

export const uploadPostImage = async (
    imageFile
) => {
    const headers =
        await getAuthorizationHeaders();

    const formData = new FormData();

    formData.append(
        "image",
        imageFile
    );

    const response =
        await ajaxRequest({
            endpoint:
                "/api/posts/upload-image",
            method: "POST",
            data: formData,
            headers,
        });

    return response.data.imageUrl;
};