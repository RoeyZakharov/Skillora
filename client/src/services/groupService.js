import ajaxRequest from "./ajaxService";

import {
    getAuthorizationHeaders,
} from "./userService";

export const createGroup = async (
    groupData
) => {
    const headers =
        await getAuthorizationHeaders();

    const response =
        await ajaxRequest({
            endpoint: "/api/groups",
            method: "POST",
            data: groupData,
            headers,
        });

    return response.data.group;
};

export const listGroups = async () => {
    const headers =
        await getAuthorizationHeaders();

    const response =
        await ajaxRequest({
            endpoint: "/api/groups",
            method: "GET",
            headers,
        });

    return response.data.groups;
};

export const getGroupById = async (
    groupId
) => {
    const headers =
        await getAuthorizationHeaders();

    const response =
        await ajaxRequest({
            endpoint:
                `/api/groups/${encodeURIComponent(
                    groupId
                )}`,
            method: "GET",
            headers,
        });

    return response.data.group;
};

export const requestToJoinGroup =
    async (groupId) => {
        const headers =
            await getAuthorizationHeaders();

        const response =
            await ajaxRequest({
                endpoint:
                    `/api/groups/${encodeURIComponent(
                        groupId
                    )}/join`,

                method: "POST",
                headers,
            });

        return response.data.group;
};

export const reviewMembershipRequest =
    async (
        groupId,
        userId,
        decision
    ) => {
        const headers =
            await getAuthorizationHeaders();

        const response =
            await ajaxRequest({
                endpoint:
                    `/api/groups/${encodeURIComponent(
                        groupId
                    )}/members/${encodeURIComponent(
                        userId
                    )}`,

                method: "PATCH",

                data: {
                    decision,
                },

                headers,
            });

        return response.data.group;
};

export const updateGroup = async (
    groupId,
    groupData
) => {
    const headers =
        await getAuthorizationHeaders();

    const response =
        await ajaxRequest({
            endpoint:
                `/api/groups/${encodeURIComponent(
                    groupId
                )}`,

            method: "PATCH",
            data: groupData,
            headers,
        });

    return response.data.group;
};

export const deleteGroup = async (
    groupId
) => {
    const headers =
        await getAuthorizationHeaders();

    return ajaxRequest({
        endpoint:
            `/api/groups/${encodeURIComponent(
                groupId
            )}`,

        method: "DELETE",
        headers,
    });
};

export const searchGroups = async (
    filters = {}
) => {
    const headers =
        await getAuthorizationHeaders();

    const response =
        await ajaxRequest({
            endpoint:
                "/api/groups/search",

            method: "GET",
            data: filters,
            headers,
        });

    return response.data.groups;
};

export const inviteUserToGroup = async (
    groupId,
    username
) => {
    const headers =
        await getAuthorizationHeaders();

    const response =
        await ajaxRequest({
            endpoint:
                `/api/groups/${encodeURIComponent(
                    groupId
                )}/invitations`,

            method: "POST",

            data: {
                username,
            },

            headers,
        });

    return response.data.group;
};

export const getMyGroupInvitations =
    async () => {
        const headers =
            await getAuthorizationHeaders();

        const response =
            await ajaxRequest({
                endpoint:
                    "/api/groups/invitations",

                method: "GET",
                headers,
            });

        return (
            response.data.invitations ||
            []
        );
    };