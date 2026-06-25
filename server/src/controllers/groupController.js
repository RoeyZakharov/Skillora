import Group from "../models/Group.js";
import User from "../models/User.js";

const escapeRegularExpression = (value) => {
    return value.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
    );
};

const serializeUserReference = (
    user
) => {
    if (!user) {
        return null;
    }

    return {
        _id: user._id,
        username: user.username,
        displayName: user.displayName,
        avatarUrl:
            user.avatarUrl || "",
    };
};

const getMemberUserId = (member) => {
    return member.user?._id
        ? member.user._id.toString()
        : member.user.toString();
};

const userCanManageGroup = (
    groupObject,
    currentUserId
) => {
    const adminId =
        groupObject.admin?._id
            ? groupObject.admin._id.toString()
            : groupObject.admin.toString();

    if (
        adminId ===
        currentUserId.toString()
    ) {
        return true;
    }

    const managerMembership =
        groupObject.members?.find(
            (member) =>
                getMemberUserId(member) ===
                    currentUserId.toString() &&
                member.status ===
                    "approved" &&
                member.role ===
                    "manager"
        );

    return Boolean(managerMembership);
};

const serializeGroup = (
    group,
    currentUserId,
    options = {}
) => {
    const {
        includeApprovedMembers = false,
        includePendingRequests = false,
    } = options;

    const groupObject =
        group.toObject
            ? group.toObject()
            : { ...group };

    const approvedMembers =
        groupObject.members?.filter(
            (member) =>
                member.status ===
                "approved"
        ) || [];

    const normalizedCurrentUserId =
        currentUserId.toString();

    const currentMembership =
        groupObject.members.find(
            (member) =>
                getMemberUserId(member) ===
                normalizedCurrentUserId
        );

    const canManage =
        currentUserId
            ? userCanManageGroup(
                  groupObject,
                  currentUserId
              )
            : false;
    
    const canInvite =
        groupObject.privacy === "private" &&
        currentMembership?.status ===
            "approved";

    const serializedGroup = {
        _id: groupObject._id,
        name: groupObject.name,
        description:
            groupObject.description,
        category:
            groupObject.category,
        city: groupObject.city,
        isOnline:
            groupObject.isOnline,
        privacy:
            groupObject.privacy,
        tags:
            groupObject.tags || [],
        admin:
            groupObject.admin,
        memberCount:
            approvedMembers.length,
        createdAt:
            groupObject.createdAt,
        updatedAt:
            groupObject.updatedAt,

        canManage,

        canInvite,

        membership: currentMembership
            ? {
                  role:
                      currentMembership.role,
                  status:
                      currentMembership.status,
                  requestedAt:
                      currentMembership.requestedAt,
                  joinedAt:
                      currentMembership.joinedAt,
              }
            : null,
    };

    if (includeApprovedMembers) {
        serializedGroup.members =
            approvedMembers.map(
                (member) => ({
                    user:
                        serializeUserReference(
                            member.user
                        ),

                    role:
                        member.role,

                    joinedAt:
                        member.joinedAt,
                })
            );
    }

    if (
        includePendingRequests &&
        canManage
    ) {
        serializedGroup.pendingRequests =
            groupObject.members
                .filter(
                    (member) =>
                        member.status ===
                        "pending"
                )
                .map((member) => ({
                    user:
                        serializeUserReference(
                            member.user
                        ),
                    requestedAt:
                        member.requestedAt,
                }));
    }

    return serializedGroup;
};

export const createGroup = async (
    req,
    res,
    next
) => {
    try {
        const group = await Group.create({
            name: req.body.name,
            description:
                req.body.description,
            category:
                req.body.category,
            city: req.body.city,
            isOnline:
                req.body.isOnline,
            privacy:
                req.body.privacy,
            tags: req.body.tags,
            admin: req.user._id,

            members: [
                {
                    user: req.user._id,
                    role: "manager",
                    status: "approved",
                    requestedAt:
                        new Date(),
                    joinedAt:
                        new Date(),
                },
            ],
        });

        await group.populate(
            "admin",
            "username displayName avatarUrl"
        );

        return res.status(201).json({
            success: true,
            message:
                "Group created successfully",
            data: {
                group:
                    serializeGroup(
                        group,
                        req.user._id
                    ),
            },
        });
    } catch (error) {
        return next(error);
    }
};

export const listGroups = async (
    req,
    res,
    next
) => {
    try {
        const groups = await Group.find({
            $or: [
                {
                    privacy: "public",
                },
                {
                    members: {
                        $elemMatch: {
                            user: req.user._id,
                            status:
                                "approved",
                        },
                    },
                },
            ],
        })
            .populate(
                "admin",
                "username displayName avatarUrl"
            )
            .sort({
                createdAt: -1,
            });

        return res.status(200).json({
            success: true,
            count: groups.length,
            data: {
                groups: groups.map((group) =>
                    serializeGroup(
                        group,
                        req.user._id
                    )
                ),
            },
        });
    } catch (error) {
        return next(error);
    }
};

export const getGroupById = async (
    req,
    res,
    next
) => {
    try {
        
        const group = await Group.findById(
            req.params.groupId
        );

        if (!group) {
            const error = new Error(
                "Group was not found"
            );

            error.statusCode = 404;

            throw error;
        }

        await group.populate([
            {
                path: "admin",
                select:
                    "username displayName avatarUrl",
            },
            {
                path: "members.user",
                select:
                    "username displayName avatarUrl",
            },
        ]);

        const currentUserId =
            req.user._id.toString();

        const adminId =
            group.admin?._id
                ? group.admin._id.toString()
                : group.admin.toString();

        const isGroupOwner =
            adminId === currentUserId;

        const privateAccessMember =
            group.members.find((member) => {
                const memberUserId =
                    member.user?._id
                        ? member.user._id.toString()
                        : member.user.toString();

                return (
                    memberUserId ===
                        currentUserId &&
                    [
                        "invited",
                        "pending",
                        "approved",
                    ].includes(member.status)
                );
            });

            const hasPrivateGroupAccess =
                Boolean(privateAccessMember);

            if (
                group.privacy === "private" &&
                !isGroupOwner &&
                !hasPrivateGroupAccess
            ) {
                const error = new Error(
                    "You do not have permission to view this private group"
                );

                error.statusCode = 403;

                throw error;
            }   

            return res.status(200).json({
                success: true,
                data: {
                    group:
                        serializeGroup(
                            group,
                            req.user._id,
                            {
                                includeApprovedMembers: true,
                                includePendingRequests: true,
                            }
                        ),
                },
            });

        } catch (error) {
            return next(error);
        }
    };

export const requestToJoinGroup = async (
    req,
    res,
    next
) => {
    try {
        const group = await Group.findById(
            req.params.groupId
        );

        if (!group) {
            const error = new Error(
                "Group was not found"
            );

            error.statusCode = 404;
            throw error;
        }

        const currentUserId =
            req.user._id.toString();

        const existingMembership =
            group.members.find(
                (member) =>
                    member.user.toString() ===
                    currentUserId
            );

        /*
         * A stranger cannot request access to a
         * private group without an invitation.
         */
        if (
            group.privacy === "private" &&
            !existingMembership
        ) {
            const error = new Error(
                "An invitation is required to join this private group"
            );

            error.statusCode = 403;
            throw error;
        }

        if (
            existingMembership?.status ===
            "approved"
        ) {
            const error = new Error(
                "You are already a member of this group"
            );

            error.statusCode = 409;
            throw error;
        }

        if (
            existingMembership?.status ===
            "pending"
        ) {
            const error = new Error(
                "A membership request is already pending"
            );

            error.statusCode = 409;
            throw error;
        }

        if (
            existingMembership?.status ===
            "invited"
        ) {
            /*
             * Convert the invitation into a
             * pending membership request.
             */
            existingMembership.status =
                "pending";

            existingMembership.role =
                "member";

            existingMembership.requestedAt =
                new Date();

            existingMembership.joinedAt =
                null;
        } else if (
            existingMembership?.status ===
            "rejected"
        ) {
            /*
             * A rejected private-group user
             * must receive another invitation.
             */
            if (
                group.privacy === "private"
            ) {
                const error = new Error(
                    "A new invitation is required for this private group"
                );

                error.statusCode = 403;
                throw error;
            }

            /*
             * Rejected users may request again
             * when the group is public.
             */
            existingMembership.status =
                "pending";

            existingMembership.role =
                "member";

            existingMembership.requestedAt =
                new Date();

            existingMembership.joinedAt =
                null;
        } else {
            /*
             * A user with no existing entry may
             * request access to a public group.
             */
            group.members.push({
                user: req.user._id,
                role: "member",
                status: "pending",
                requestedAt: new Date(),
                joinedAt: null,
            });
        }

        await group.save();

        await group.populate([
            {
                path: "admin",
                select:
                    "username displayName avatarUrl",
            },
            {
                path: "members.user",
                select:
                    "username displayName avatarUrl",
            },
        ]);

        return res.status(200).json({
            success: true,
            message:
                "Membership request sent successfully",

            data: {
                group: serializeGroup(
                    group,
                    req.user._id,
                    {
                        includeApprovedMembers:
                            true,
                    }
                ),
            },
        });
    } catch (error) {
        return next(error);
    }
};

export const reviewMembershipRequest =
    async (req, res, next) => {
        try {
            const membership =
                req.group.members.find(
                    (member) =>
                        member.user.toString() ===
                        req.params.userId
                );

            if (!membership) {
                const error = new Error(
                    "Membership request was not found"
                );

                error.statusCode = 404;

                throw error;
            }

            if (
                membership.status !==
                "pending"
            ) {
                const error = new Error(
                    "This membership request is no longer pending"
                );

                error.statusCode = 409;

                throw error;
            }

            if (
                req.body.decision ===
                "approve"
            ) {
                membership.status =
                    "approved";

                membership.role =
                    "member";

                membership.joinedAt =
                    new Date();
            } else {
                membership.status =
                    "rejected";

                membership.joinedAt =
                    null;
            }

            await req.group.save();

            await req.group.populate([
                {
                    path: "admin",
                    select:
                        "username displayName avatarUrl",
                },
                {
                    path: "members.user",
                    select:
                        "username displayName avatarUrl",
                },
            ]);

            const message =
                req.body.decision ===
                "approve"
                    ? "Membership request approved"
                    : "Membership request rejected";

            return res
                .status(200)
                .json({
                    success: true,
                    message,
                    data: {
                        group:
                            serializeGroup(
                                req.group,
                                req.user._id,
                                {
                                    includeApprovedMembers: true,
                                    includePendingRequests: true,
                                }
                            ),
                    },
                });
        } catch (error) {
            return next(error);
        }
};

export const updateGroup = async (
    req,
    res,
    next
) => {
    try {
        const editableFields = [
            "name",
            "description",
            "category",
            "city",
            "isOnline",
            "privacy",
            "tags",
        ];

        for (const field of editableFields) {
            if (field in req.body) {
                req.group[field] =
                    req.body[field];
            }
        }

        await req.group.save();

        await req.group.populate([
            {
                path: "admin",
                select:
                    "username displayName avatarUrl",
            },
            {
                path: "members.user",
                select:
                    "username displayName avatarUrl",
            },
        ]);

        return res.status(200).json({
            success: true,
            message:
                "Group updated successfully",

            data: {
                group: serializeGroup(
                    req.group,
                    req.user._id,
                    {
                        includeApprovedMembers:
                            true,

                        includePendingRequests:
                            true,
                    }
                ),
            },
        });
    } catch (error) {
        return next(error);
    }
};

export const deleteGroup = async (
    req,
    res,
    next
) => {
    try {
        await req.group.deleteOne();

        return res.status(200).json({
            success: true,
            message:
                "Group deleted successfully",
        });
    } catch (error) {
        return next(error);
    }
};

export const searchGroups = async (
    req,
    res,
    next
) => {
    try {
        const {
            keyword = "",
            category = "",
            city = "",
            privacy = "",
            format = "",
            tags = "",
            minMembers = "",
        } = req.query;

        if (
            privacy &&
            !["public", "private"].includes(
                privacy
            )
        ) {
            const error = new Error(
                "Privacy must be public or private"
            );

            error.statusCode = 400;

            throw error;
        }

        if (
            format &&
            ![
                "online",
                "in-person",
            ].includes(format)
        ) {
            const error = new Error(
                "Format must be online or in-person"
            );

            error.statusCode = 400;

            throw error;
        }

        let minimumMemberCount = 0;

        if (minMembers !== "") {
            minimumMemberCount =
                Number.parseInt(
                    minMembers,
                    10
                );

            if (
                Number.isNaN(
                    minimumMemberCount
                ) ||
                minimumMemberCount < 0
            ) {
                const error = new Error(
                    "Minimum members must be zero or greater"
                );

                error.statusCode = 400;

                throw error;
            }
        }

        const visibilityCondition = {
            $or: [
                {
                    privacy: "public",
                },
                {
                    members: {
                        $elemMatch: {
                            user: req.user._id,
                            status:
                                "approved",
                        },
                    },
                },
            ],
        };

        const searchConditions = [
            visibilityCondition,
        ];

        if (keyword.trim()) {
            const keywordExpression =
                new RegExp(
                    escapeRegularExpression(
                        keyword.trim()
                    ),
                    "i"
                );

            searchConditions.push({
                $or: [
                    {
                        name:
                            keywordExpression,
                    },
                    {
                        description:
                            keywordExpression,
                    },
                    {
                        tags:
                            keywordExpression,
                    },
                ],
            });
        }

        if (category.trim()) {
            searchConditions.push({
                category: {
                    $regex:
                        `^${escapeRegularExpression(
                            category.trim()
                        )}$`,

                    $options: "i",
                },
            });
        }

        if (city.trim()) {
            searchConditions.push({
                city: {
                    $regex:
                        escapeRegularExpression(
                            city.trim()
                        ),

                    $options: "i",
                },
            });
        }

        if (privacy) {
            searchConditions.push({
                privacy,
            });
        }

        if (format === "online") {
            searchConditions.push({
                isOnline: true,
            });
        }

        if (format === "in-person") {
            searchConditions.push({
                isOnline: false,
            });
        }

        const requestedTags = tags
            .split(",")
            .map((tag) =>
                tag
                    .trim()
                    .toLowerCase()
            )
            .filter(Boolean);

        if (requestedTags.length > 0) {
            searchConditions.push({
                tags: {
                    $all: requestedTags,
                },
            });
        }

        const groups = await Group.find({
            $and: searchConditions,
        })
            .populate(
                "admin",
                "username displayName avatarUrl"
            )
            .sort({
                createdAt: -1,
            });

        const matchingGroups =
            groups.filter((group) => {
                const approvedCount =
                    group.members.filter(
                        (member) =>
                            member.status ===
                            "approved"
                    ).length;

                return (
                    approvedCount >=
                    minimumMemberCount
                );
            });

        return res.status(200).json({
            success: true,
            count:
                matchingGroups.length,

            data: {
                groups:
                    matchingGroups.map(
                        (group) =>
                            serializeGroup(
                                group,
                                req.user._id
                            )
                    ),
            },
        });
    } catch (error) {
        return next(error);
    }
};

export const inviteUserToGroup = async (
    req,
    res,
    next
) => {
    try {
        if (
            req.group.privacy !==
            "private"
        ) {
            const error = new Error(
                "Invitations are only available for private groups"
            );

            error.statusCode = 400;

            throw error;
        }

        const usernameExpression =
            new RegExp(
                `^${escapeRegularExpression(
                    req.body.username
                )}$`,
                "i"
            );

        const invitedUser =
            await User.findOne({
                username:
                    usernameExpression,
            });

        if (!invitedUser) {
            const error = new Error(
                "No Skillora user was found with that username"
            );

            error.statusCode = 404;

            throw error;
        }

        if (
            invitedUser._id.toString() ===
            req.user._id.toString()
        ) {
            const error = new Error(
                "You cannot invite yourself"
            );

            error.statusCode = 400;

            throw error;
        }

        const existingMember =
            req.group.members.find(
                (member) => {
                    const memberUserId =
                        member.user?._id
                            ? member.user._id.toString()
                            : member.user.toString();

                    return (
                        memberUserId ===
                        invitedUser._id.toString()
                    );
                }
            );

        if (
            existingMember?.status ===
            "approved"
        ) {
            const error = new Error(
                "This user is already a member"
            );

            error.statusCode = 409;

            throw error;
        }

        if (
            existingMember?.status ===
            "pending"
        ) {
            const error = new Error(
                "This user already has a pending request"
            );

            error.statusCode = 409;

            throw error;
        }

        if (
            existingMember?.status ===
            "invited"
        ) {
            const error = new Error(
                "This user has already been invited"
            );

            error.statusCode = 409;

            throw error;
        }

        if (
            existingMember?.status ===
            "rejected"
        ) {
            existingMember.status =
                "invited";

            existingMember.role =
                "member";

            existingMember.invitedBy =
                req.user._id;

            existingMember.invitedAt =
                new Date();

            existingMember.requestedAt =
                null;

            existingMember.joinedAt =
                null;
        } else {
            req.group.members.push({
                user: invitedUser._id,
                role: "member",
                status: {
                    $in: [
                        "invited",
                        "pending",
                    ],
                },
                invitedBy:
                    req.user._id,
                invitedAt:
                    new Date(),
                requestedAt: null,
                joinedAt: null,
            });
        }

        await req.group.save();

        await req.group.populate([
            {
                path: "admin",
                select:
                    "username displayName avatarUrl",
            },
            {
                path: "members.user",
                select:
                    "username displayName avatarUrl",
            },
        ]);

        return res.status(200).json({
            success: true,
            message:
                `${invitedUser.username} was invited successfully`,

            data: {
                group: serializeGroup(
                    req.group,
                    req.user._id,
                    {
                        includeApprovedMembers:
                            true,

                        includePendingRequests:
                            true,
                    }
                ),
            },
        });
    } catch (error) {
        return next(error);
    }
};

export const getMyGroupInvitations = async (
    req,
    res,
    next
) => {
    try {
        const currentUserId =
            req.user._id.toString();

        const groups = await Group.find({
            members: {
                $elemMatch: {
                    user: req.user._id,
                    status: {
                        $in: [
                            "invited",
                            "pending",
                        ],
                    },
                },
            },
        })
            .populate(
                "admin",
                "username displayName avatarUrl"
            )
            .populate(
                "members.user",
                "username displayName avatarUrl"
            )
            .populate(
                "members.invitedBy",
                "username displayName avatarUrl"
            )
            .sort({
                updatedAt: -1,
            });

        const invitations = groups
            .map((group) => {
                const invitationEntry =
                    group.members.find(
                        (member) =>
                            getMemberUserId(
                                member
                            ) ===
                                currentUserId &&
                            [
                                "invited",
                                "pending",
                            ].includes(member.status)
                    );

                if (!invitationEntry) {
                    return null;
                }

                return {
                    groupId:
                        group._id,

                    groupName:
                        group.name,

                    groupDescription:
                        group.description,

                    category:
                        group.category,

                    city:
                        group.city,

                    isOnline:
                        group.isOnline,

                    privacy:
                        group.privacy,
                    
                    status:
                        invitationEntry.status,

                    requestedAt:
                        invitationEntry.requestedAt,

                    invitedAt:
                        invitationEntry.invitedAt,

                    invitedBy:
                        invitationEntry.invitedBy
                            ? {
                                  _id:
                                      invitationEntry
                                          .invitedBy
                                          ._id,

                                  username:
                                      invitationEntry
                                          .invitedBy
                                          .username,

                                  displayName:
                                      invitationEntry
                                          .invitedBy
                                          .displayName,

                                  avatarUrl:
                                      invitationEntry
                                          .invitedBy
                                          .avatarUrl,
                              }
                            : null,
                };
            })
            .filter(Boolean);

        return res.status(200).json({
            success: true,
            count: invitations.length,

            data: {
                invitations,
            },
        });
    } catch (error) {
        return next(error);
    }
};