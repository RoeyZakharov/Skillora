import Group from "../models/Group.js";
import Post from "../models/Post.js";

export const createPost = async (
    req,
    res,
    next
) => {
    try {
        const {
            content,
            groupId = null,
        } = req.body;

        let group = null;

        if (groupId) {
            group = await Group.findById(
                groupId
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

            const isApprovedMember =
                group.members.some(
                    (member) =>
                        member.user.toString() ===
                            currentUserId &&
                        member.status ===
                            "approved"
                );

            if (!isApprovedMember) {
                const error = new Error(
                    "Only approved group members can create posts in this group"
                );

                error.statusCode = 403;
                throw error;
            }
        }

        const post = await Post.create({
            author: req.user._id,
            group: group?._id || null,
            content,
            postType: "text",
        });

        await post.populate([
            {
                path: "author",
                select:
                    "username displayName avatarUrl",
            },
            {
                path: "group",
                select:
                    "name privacy",
            },
        ]);

        return res.status(201).json({
            success: true,
            message:
                "Post created successfully",

            data: {
                post,
            },
        });
    } catch (error) {
        return next(error);
    }
};

export const getFeedPosts = async (
    req,
    res,
    next
) => {
    try {
        const approvedGroups =
            await Group.find({
                members: {
                    $elemMatch: {
                        user: req.user._id,
                        status: "approved",
                    },
                },
            }).select("_id");

        const approvedGroupIds =
            approvedGroups.map(
                (group) => group._id
            );

        const friendIds =
            req.user.friends || [];

        const visibleAuthorIds = [
            req.user._id,
            ...friendIds,
        ];

        const posts = await Post.find({
            $or: [
                {
                    group: null,

                    author: {
                        $in: visibleAuthorIds,
                    },
                },
                {
                    group: {
                        $in: approvedGroupIds,
                    },
                },
            ],
        })
            .populate(
                "author",
                "username displayName avatarUrl"
            )
            .populate(
                "group",
                "name privacy"
            )
            .sort({
                createdAt: -1,
            })
            .limit(50);

        return res.status(200).json({
            success: true,
            count: posts.length,

            data: {
                posts,
            },
        });
    } catch (error) {
        return next(error);
    }
};