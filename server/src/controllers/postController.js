import Notification from "../models/Notification.js";
import Group from "../models/Group.js";
import Post from "../models/Post.js";

const getReferenceId = (reference) => {
    return reference?._id
        ? reference._id.toString()
        : reference.toString();
};

const userCanManageGroup = (
    group,
    userId
) => {
    const normalizedUserId =
        userId.toString();

    const adminId =
        getReferenceId(group.admin);

    if (adminId === normalizedUserId) {
        return true;
    }

    return group.members.some(
        (member) =>
            getReferenceId(
                member.user
            ) === normalizedUserId &&
            member.status ===
                "approved" &&
            member.role === "manager"
    );
};

const userIsApprovedGroupMember = (
    group,
    userId
) => {
    if (!group) {
        return false;
    }

    const normalizedUserId =
        userId.toString();

    const adminId =
        getReferenceId(group.admin);

    if (adminId === normalizedUserId) {
        return true;
    }

    return group.members.some(
        (member) =>
            getReferenceId(
                member.user
            ) === normalizedUserId &&
            member.status ===
                "approved"
    );
};

const serializePost = (
    post,
    currentUserId
) => {
    const postObject =
        post.toObject();

    const normalizedCurrentUserId =
        currentUserId.toString();

    const isAuthor =
        getReferenceId(
            postObject.author
        ) === normalizedCurrentUserId;

    const isGroupManager =
        postObject.group
            ? userCanManageGroup(
                  postObject.group,
                  normalizedCurrentUserId
              )
            : false;

    const comments =
        postObject.comments.map(
            (comment) => ({
                ...comment,

                canDelete:
                    getReferenceId(
                        comment.author
                    ) ===
                        normalizedCurrentUserId ||
                    isGroupManager,
            })
        );
    
    const likedByCurrentUser =
        postObject.likes.some(
            (userId) =>
                getReferenceId(userId) ===
                normalizedCurrentUserId
        );

    const canLike =
        Boolean(postObject.group) &&
        userIsApprovedGroupMember(
            postObject.group,
            normalizedCurrentUserId
        );

    return {
        ...postObject,

        group: postObject.group
            ? {
                  _id:
                      postObject.group._id,
                  name:
                      postObject.group.name,
                  privacy:
                      postObject.group.privacy,
              }
            : null,

        canEdit: isAuthor,

        canDelete:
            isAuthor ||
            isGroupManager,
        
        likeCount:
            postObject.likes.length,

        likedByCurrentUser,

        canLike,

        comments,

        commentCount:
            postObject.comments.length,

        canComment: canLike,
    };
};

export const createPost = async (
    req,
    res,
    next
) => {
    try {
        const {
                content,
                groupId,
                postType = "text",
                mediaUrl = "",
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
            group: groupId || null,
            content,
            postType,
            mediaUrl:
                postType === "video"
                    ? mediaUrl
                    : "",
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
                    "name privacy admin member",
            },
            {
                path: "comments.author",
                select: "username displayName avatarUrl",
            },
        ]);

        return res.status(201).json({
            success: true,
            message:
                "Post created successfully",

            data: {
                post: serializePost(
                    post,
                    req.user._id
                ),
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
                "name privacy admin members"
            )
            .populate(
                "comments.author",
                "username displayName avatarUrl"
            )
            .sort({
                createdAt: -1,
            })
            .limit(50);

        return res.status(200).json({
            success: true,
            count: posts.length,

            data: {
                posts: posts.map(
                    (post) =>
                        serializePost(
                            post,
                            req.user._id
                        )
                ),
            },
        });
    } catch (error) {
        return next(error);
    }
};

export const getGroupPosts = async (
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
                "Only approved group members can view group posts"
            );

            error.statusCode = 403;
            throw error;
        }

        const posts = await Post.find({
            group: group._id,
        })
            .populate(
                "author",
                "username displayName avatarUrl"
            )
            .populate(
                "group",
                "name privacy admin members"
            )
            .populate(
                "comments.author",
                "username displayName avatarUrl"
            )
            .sort({
                createdAt: -1,
            });

        return res.status(200).json({
            success: true,
            count: posts.length,

            data: {
                posts: posts.map(
                    (post) =>
                        serializePost(
                            post,
                            req.user._id
                        )
                ),
            },
        });
    } catch (error) {
        return next(error);
    }
};

export const updatePost = async (
    req,
    res,
    next
) => {
    try {
        const post =
            await Post.findById(
                req.params.postId
            );

        if (!post) {
            const error = new Error(
                "Post was not found"
            );

            error.statusCode = 404;
            throw error;
        }

        const isAuthor =
            getReferenceId(
                post.author
            ) ===
            req.user._id.toString();

        if (!isAuthor) {
            const error = new Error(
                "Only the post author can edit this post"
            );

            error.statusCode = 403;
            throw error;
        }

        post.content =
            req.body.content;

        await post.save();

        await post.populate([
            {
                path: "author",
                select:
                    "username displayName avatarUrl",
            },
            {
                path: "group",
                select:
                    "name privacy admin members",
            },
            {
                path: "comments.author",
                select: "username displayName avatarUrl",
            },
        ]);

        return res.status(200).json({
            success: true,
            message:
                "Post updated successfully",

            data: {
                post: serializePost(
                    post,
                    req.user._id
                ),
            },
        });
    } catch (error) {
        return next(error);
    }
};

export const deletePost = async (
    req,
    res,
    next
) => {
    try {
        const post =
            await Post.findById(
                req.params.postId
            );

        if (!post) {
            const error = new Error(
                "Post was not found"
            );

            error.statusCode = 404;
            throw error;
        }

        const currentUserId =
            req.user._id.toString();

        const authorId =
            getReferenceId(
                post.author
            );

        const isAuthor =
            authorId === currentUserId;

        let group = null;
        let isGroupManager = false;

        if (post.group) {
            group =
                await Group.findById(
                    post.group
                );

            if (group) {
                isGroupManager =
                    userCanManageGroup(
                        group,
                        currentUserId
                    );
            }
        }

        if (
            !isAuthor &&
            !isGroupManager
        ) {
            const error = new Error(
                "You do not have permission to delete this post"
            );

            error.statusCode = 403;
            throw error;
        }

        const managerDeletedPost =
            !isAuthor &&
            isGroupManager &&
            Boolean(group);

        const postExcerpt =
            post.content
                .trim()
                .slice(0, 300);

        await post.deleteOne();

        if (managerDeletedPost) {
            await Notification.create({
                recipient: authorId,
                actor: req.user._id,
                type:
                    "group_post_removed",
                group: group._id,

                message:
                    `Your post in ${group.name} was removed by a group manager.`,

                postExcerpt,
                isRead: false,
            });
        }

        return res.status(200).json({
            success: true,
            message:
                "Post deleted successfully",
        });
    } catch (error) {
        return next(error);
    }
};

export const togglePostLike = async (
    req,
    res,
    next
) => {
    try {
        const post =
            await Post.findById(
                req.params.postId
            );

        if (!post) {
            const error = new Error(
                "Post was not found"
            );

            error.statusCode = 404;
            throw error;
        }

        if (!post.group) {
            const error = new Error(
                "Likes are currently available only for group posts"
            );

            error.statusCode = 400;
            throw error;
        }

        const group =
            await Group.findById(
                post.group
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

        if (
            !userIsApprovedGroupMember(
                group,
                currentUserId
            )
        ) {
            const error = new Error(
                "Only approved group members can like this post"
            );

            error.statusCode = 403;
            throw error;
        }

        const existingLikeIndex =
            post.likes.findIndex(
                (userId) =>
                    getReferenceId(
                        userId
                    ) === currentUserId
            );

        let liked;

        if (existingLikeIndex >= 0) {
            post.likes.splice(
                existingLikeIndex,
                1
            );

            liked = false;
        } else {
            post.likes.push(
                req.user._id
            );

            liked = true;
        }

        await post.save();

        const authorId =
            getReferenceId(
                post.author
            );

        const likedByAnotherUser =
            liked &&
            authorId !== currentUserId;

        if (likedByAnotherUser) {
            const postExcerpt =
                post.content
                    .trim()
                    .slice(0, 300);

            await Notification.create({
                recipient: authorId,
                actor: req.user._id,
                type: "post_liked",
                group: group._id,
                post: post._id,

                message:
                    `${req.user.displayName || req.user.username} liked your post in ${group.name}.`,

                postExcerpt,
                isRead: false,
            });
        }

        await post.populate([
            {
                path: "author",
                select:
                    "username displayName avatarUrl",
            },
            {
                path: "group",
                select:
                    "name privacy admin members",
            },
            {
                path: "comments.author",
                select: "username displayName avatarUrl",
            },
        ]);

        return res.status(200).json({
            success: true,
            message: liked
                ? "Post liked successfully"
                : "Post unliked successfully",

            data: {
                post: serializePost(
                    post,
                    req.user._id
                ),
            },
        });
    } catch (error) {
        return next(error);
    }
};

export const addPostComment = async (
    req,
    res,
    next
) => {
    try {
        const content =
            req.body.content?.trim();

        if (!content) {
            const error = new Error(
                "Comment content is required"
            );

            error.statusCode = 400;
            throw error;
        }

        if (content.length > 1000) {
            const error = new Error(
                "Comment cannot exceed 1000 characters"
            );

            error.statusCode = 400;
            throw error;
        }

        const post =
            await Post.findById(
                req.params.postId
            );

        if (!post) {
            const error = new Error(
                "Post was not found"
            );

            error.statusCode = 404;
            throw error;
        }

        if (!post.group) {
            const error = new Error(
                "Comments are currently available only for group posts"
            );

            error.statusCode = 400;
            throw error;
        }

        const group =
            await Group.findById(
                post.group
            );

        if (!group) {
            const error = new Error(
                "Group was not found"
            );

            error.statusCode = 404;
            throw error;
        }

        if (
            !userIsApprovedGroupMember(
                group,
                req.user._id
            )
        ) {
            const error = new Error(
                "Only approved group members can comment on this post"
            );

            error.statusCode = 403;
            throw error;
        }

        post.comments.push({
            author: req.user._id,
            content,
        });

        await post.save();

        const postAuthorId =
            getReferenceId(post.author);

        const currentUserId =
            req.user._id.toString();

        if (postAuthorId !== currentUserId) {
            await Notification.create({
                recipient: postAuthorId,
                actor: req.user._id,
                type: "post_commented",
                group: group._id,
                post: post._id,

                message:
                    `${
                        req.user.displayName ||
                        req.user.username
                    } commented on your post in ${group.name}.`,

                postExcerpt:
                    post.content
                        .trim()
                        .slice(0, 300),

                isRead: false,
            });
        }

        await post.populate([
            {
                path: "author",
                select:
                    "username displayName avatarUrl",
            },
            {
                path: "group",
                select:
                    "name privacy admin members",
            },
            {
                path: "comments.author",
                select:
                    "username displayName avatarUrl",
            },
        ]);

        return res.status(201).json({
            success: true,
            message:
                "Comment added successfully",

            data: {
                post: serializePost(
                    post,
                    req.user._id
                ),
            },
        });
    } catch (error) {
        return next(error);
    }
};

export const deletePostComment = async (
    req,
    res,
    next
) => {
    try {
        const post = await Post.findById(
            req.params.postId
        );

        if (!post) {
            const error = new Error(
                "Post was not found"
            );

            error.statusCode = 404;
            throw error;
        }

        const comment = post.comments.id(
            req.params.commentId
        );

        if (!comment) {
            const error = new Error(
                "Comment was not found"
            );

            error.statusCode = 404;
            throw error;
        }

        if (!post.group) {
            const error = new Error(
                "This comment does not belong to a group post"
            );

            error.statusCode = 400;
            throw error;
        }

        const group = await Group.findById(
            post.group
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

        const isCommentAuthor =
            getReferenceId(
                comment.author
            ) === currentUserId;

        const isGroupManager =
            userCanManageGroup(
                group,
                currentUserId
            );

        if (
            !isCommentAuthor &&
            !isGroupManager
        ) {
            const error = new Error(
                "You are not allowed to delete this comment"
            );

            error.statusCode = 403;
            throw error;
        }

        post.comments.pull(
            comment._id
        );

        await post.save();

        await post.populate([
            {
                path: "author",
                select:
                    "username displayName avatarUrl",
            },
            {
                path: "group",
                select:
                    "name privacy admin members",
            },
            {
                path: "comments.author",
                select:
                    "username displayName avatarUrl",
            },
        ]);

        return res.status(200).json({
            success: true,
            message:
                "Comment deleted successfully",

            data: {
                post: serializePost(
                    post,
                    req.user._id
                ),
            },
        });
    } catch (error) {
        return next(error);
    }
};

export const uploadPostVideo = async (
    req,
    res,
    next
) => {
    try {
        if (!req.file) {
            const error = new Error(
                "Video file is required"
            );

            error.statusCode = 400;
            throw error;
        }

        const videoUrl =
            `${req.protocol}://${req.get(
                "host"
            )}/uploads/videos/${req.file.filename}`;

        return res.status(201).json({
            success: true,
            message:
                "Video uploaded successfully",

            data: {
                videoUrl,
            },
        });
    } catch (error) {
        return next(error);
    }
};