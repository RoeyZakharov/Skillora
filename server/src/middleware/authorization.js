import User from "../models/User.js";
import Group from "../models/Group.js";

export const requireSkilloraUser = async (
    req,
    res,
    next
) => {
    try {
        const user = await User.findOne({
            firebaseUid:
                req.firebaseUser.uid,
        });

        if (!user) {
            const error = new Error(
                "Skillora user profile was not found"
            );

            error.statusCode = 404;

            return next(error);
        }

        req.user = user;

        return next();
    } catch (error) {
        return next(error);
    }
};

export const loadGroup = async (
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

            return next(error);
        }

        req.group = group;

        return next();
    } catch (error) {
        return next(error);
    }
};

export const requireGroupManager = (
    req,
    res,
    next
) => {
    const currentUserId =
        req.user._id.toString();

    const isGroupOwner =
        req.group.admin.toString() ===
        currentUserId;

    const managerMembership =
        req.group.members.find(
            (member) =>
                member.user.toString() ===
                    currentUserId &&
                member.status ===
                    "approved" &&
                member.role ===
                    "manager"
        );

    if (
        !isGroupOwner &&
        !managerMembership
    ) {
        const error = new Error(
            "Group manager permission is required"
        );

        error.statusCode = 403;

        return next(error);
    }

    return next();
};

export const requireApprovedGroupMember = (
    req,
    res,
    next
) => {
    const currentUserId =
        req.user._id.toString();

    const isApprovedMember =
        req.group.members.some(
            (member) => {
                const memberUserId =
                    member.user?._id
                        ? member.user._id.toString()
                        : member.user.toString();

                return (
                    memberUserId ===
                        currentUserId &&
                    member.status ===
                        "approved"
                );
            }
        );

    if (!isApprovedMember) {
        return res.status(403).json({
            success: false,
            message:
                "Only approved group members can send invitations",
        });
    }

    return next();
};