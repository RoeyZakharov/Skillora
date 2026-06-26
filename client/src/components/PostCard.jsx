"use client";

import Link from "next/link";
import { useState } from "react";
import VideoPost from "./VideoPost";

import {
    addPostComment,
    deletePost,
    deletePostComment,
    togglePostLike,
    updatePost,
} from "../services/postService";

const getInitials = (user) => {
    const name =
        user?.displayName?.trim() ||
        user?.username?.trim() ||
        "Skillora User";

    return name
        .split(/\s+/)
        .slice(0, 2)
        .map((part) =>
            part.charAt(0).toUpperCase()
        )
        .join("");
};

const formatPostDate = (createdAt) => {
    if (!createdAt) {
        return "";
    }

    return new Intl.DateTimeFormat(
        "en-US",
        {
            dateStyle: "medium",
            timeStyle: "short",
        }
    ).format(new Date(createdAt));
};

export default function PostCard({
    post,
    onPostUpdated,
    onPostDeleted,
}) {
    const [isEditing, setIsEditing] =
        useState(false);

    const [editedContent, setEditedContent] =
        useState(post.content);

    const [isSaving, setIsSaving] =
        useState(false);

    const [isDeleting, setIsDeleting] =
        useState(false);
    
    const [isLiking, setIsLiking] =
        useState(false);

    const [commentContent, setCommentContent] =
        useState("");

    const [isAddingComment, setIsAddingComment] =
        useState(false);

    const [deletingCommentId, setDeletingCommentId] =
        useState(null);

    const [isDeleted, setIsDeleted] =
        useState(false);

    const [actionError, setActionError] =
        useState("");

    const profilePath =
        `/profile/${encodeURIComponent(
            post.author.username
        )}`;

    const handleUpdate = async (
        event
    ) => {
        event.preventDefault();

        const normalizedContent =
            editedContent.trim();

        if (!normalizedContent) {
            setActionError(
                "Post content cannot be empty."
            );

            return;
        }

        setIsSaving(true);
        setActionError("");

        try {
            const updatedPost =
                await updatePost(
                    post._id,
                    normalizedContent
                );

            setEditedContent(
                updatedPost.content
            );

            setIsEditing(false);

            onPostUpdated?.(
                updatedPost
            );
        } catch (error) {
            setActionError(
                error.message ||
                    "Could not update the post."
            );
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteComment = async (
        commentId
    ) => {
        const shouldDelete =
            window.confirm(
                "Are you sure you want to delete this comment?"
            );

        if (!shouldDelete) {
            return;
        }

        setDeletingCommentId(commentId);
        setActionError("");

        try {
            const updatedPost =
                await deletePostComment(
                    post._id,
                    commentId
                );

            onPostUpdated?.(updatedPost);
        } catch (error) {
            setActionError(
                error.message ||
                    "Could not delete the comment."
            );
        } finally {
            setDeletingCommentId(null);
        }
    };

    const handleAddComment = async (
        event
    ) => {
        event.preventDefault();

        const normalizedContent =
            commentContent.trim();

        if (!normalizedContent) {
            return;
        }

        setIsAddingComment(true);
        setActionError("");

        try {
            const updatedPost =
                await addPostComment(
                    post._id,
                    normalizedContent
                );

            setCommentContent("");

            onPostUpdated?.(
                updatedPost
            );
        } catch (error) {
            setActionError(
                error.message ||
                    "Could not add the comment."
            );
        } finally {
            setIsAddingComment(false);
        }
    };

    const handleToggleLike = async () => {
        setIsLiking(true);
        setActionError("");

        try {
            const updatedPost =
                await togglePostLike(
                    post._id
                );

            onPostUpdated?.(
                updatedPost
            );
        } catch (error) {
            setActionError(
                error.message ||
                    "Could not update the post like."
            );
        } finally {
            setIsLiking(false);
        }
    };

    const handleDelete = async () => {
        const shouldDelete =
            window.confirm(
                "Are you sure you want to delete this post?"
            );

        if (!shouldDelete) {
            return;
        }

        setIsDeleting(true);
        setActionError("");

        try {
            await deletePost(post._id);

            setIsDeleted(true);

            onPostDeleted?.(
                post._id
            );
        } catch (error) {
            setActionError(
                error.message ||
                    "Could not delete the post."
            );

            setIsDeleting(false);
        }
    };

    if (isDeleted) {
        return null;
    }

    return (
        <article className="skillora-post-card">
            <header className="skillora-post-card-header">
                <Link
                    href={profilePath}
                    className="skillora-post-author-avatar"
                >
                    {post.author.avatarUrl ? (
                        <img
                            src={
                                post.author
                                    .avatarUrl
                            }
                            alt=""
                        />
                    ) : (
                        getInitials(
                            post.author
                        )
                    )}
                </Link>

                <div className="skillora-post-author-details">
                    <Link
                        href={profilePath}
                        className="skillora-post-author-name"
                    >
                        {
                            post.author
                                .displayName
                        }
                    </Link>

                    <span>
                        @
                        {
                            post.author
                                .username
                        }
                    </span>

                    <time dateTime={post.createdAt}>
                        {formatPostDate(post.createdAt)}
                    </time>
                </div>

                {(post.canEdit ||
                    post.canDelete) && (
                    <div className="skillora-post-management">
                        {post.canEdit && (
                            <button
                                type="button"
                                onClick={() => {
                                    setIsEditing(
                                        true
                                    );

                                    setEditedContent(
                                        post.content
                                    );

                                    setActionError(
                                        ""
                                    );
                                }}
                                disabled={
                                    isSaving ||
                                    isDeleting
                                }
                            >
                                Edit
                            </button>
                        )}

                        {post.canDelete && (
                            <button
                                type="button"
                                className="skillora-post-delete-button"
                                onClick={
                                    handleDelete
                                }
                                disabled={
                                    isSaving ||
                                    isDeleting
                                }
                            >
                                {isDeleting
                                    ? "Deleting..."
                                    : "Delete"}
                            </button>
                        )}
                    </div>
                )}
            </header>

            {post.group && (
                <Link
                    href={`/groups/${post.group._id}`}
                    className="skillora-post-group"
                >
                    Posted in{" "}
                    <strong>
                        {post.group.name}
                    </strong>
                </Link>
            )}

            {isEditing ? (
                <form
                    className="skillora-post-edit-form"
                    onSubmit={
                        handleUpdate
                    }
                >
                    <textarea
                        value={
                            editedContent
                        }
                        onChange={(event) => {
                            setEditedContent(
                                event.target.value
                            );

                            setActionError(
                                ""
                            );
                        }}
                        maxLength={3000}
                        rows={5}
                        disabled={
                            isSaving
                        }
                        autoFocus
                    />

                    <div className="skillora-post-edit-actions">
                        <button
                            type="button"
                            onClick={() => {
                                setIsEditing(
                                    false
                                );

                                setEditedContent(
                                    post.content
                                );

                                setActionError(
                                    ""
                                );
                            }}
                            disabled={
                                isSaving
                            }
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={
                                isSaving ||
                                !editedContent.trim()
                            }
                        >
                            {isSaving
                                ? "Saving..."
                                : "Save changes"}
                        </button>
                    </div>
                </form>
            ) : (
                <p className="skillora-post-content">
                    {post.content}
                </p>
            )}

            {post.postType === "video" &&
                post.mediaUrl && (
                    <VideoPost
                        videoUrl={post.mediaUrl}
                    />
                )}
            
            {post.canLike && (
                <div className="skillora-post-social-actions">
                    <button
                        type="button"
                        className={
                            post.likedByCurrentUser
                                ? "skillora-post-like-button skillora-post-like-button-active"
                                : "skillora-post-like-button"
                        }
                        onClick={
                            handleToggleLike
                        }
                        disabled={isLiking}
                    >
                        {isLiking
                            ? "Updating..."
                            : post.likedByCurrentUser
                            ? "Unlike"
                            : "Like"}
                    </button>

                    <span className="skillora-post-like-count">
                        {post.likeCount || 0}{" "}
                        {(post.likeCount || 0) === 1
                            ? "like"
                            : "likes"}
                    </span>
                </div>
            )}

            {post.group && (
                <section className="skillora-post-comments">
                    <h3>
                        Comments ({post.commentCount || 0})
                    </h3>

                    {post.comments?.length > 0 && (
                        <div className="skillora-post-comments-list">
                            {post.comments.map(
                                (comment) => {
                                    const username =
                                        comment.author
                                            ?.username;

                                    const displayName =
                                        comment.author
                                            ?.displayName ||
                                        username ||
                                        "Skillora user";

                                    return (
                                        <article
                                            key={comment._id}
                                            className="skillora-post-comment"
                                        >
                                            <div className="skillora-post-comment-header">
                                                {username ? (
                                                    <Link
                                                        href={`/profile/${encodeURIComponent(
                                                            username
                                                        )}`}
                                                    >
                                                        <strong>
                                                            {
                                                                displayName
                                                            }
                                                        </strong>
                                                    </Link>
                                                ) : (
                                                    <strong>
                                                        {
                                                            displayName
                                                        }
                                                    </strong>
                                                )}

                                                <div className="skillora-post-comment-controls">
                                                    <time
                                                        dateTime={
                                                            comment.createdAt
                                                        }
                                                    >
                                                        {formatPostDate(
                                                            comment.createdAt
                                                        )}
                                                    </time>

                                                    {comment.canDelete && (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleDeleteComment(
                                                                    comment._id
                                                                )
                                                            }
                                                            disabled={
                                                                deletingCommentId ===
                                                                comment._id
                                                            }
                                                        >
                                                            {deletingCommentId ===
                                                            comment._id
                                                                ? "Deleting..."
                                                                : "Delete"}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            <p>
                                                {
                                                    comment.content
                                                }
                                            </p>
                                        </article>
                                    );
                                }
                            )}
                        </div>
                    )}

                    {post.canComment && (
                        <form
                            className="skillora-post-comment-form"
                            onSubmit={
                                handleAddComment
                            }
                        >
                            <textarea
                                value={
                                    commentContent
                                }
                                onChange={(event) => {
                                    setCommentContent(
                                        event.target.value
                                    );

                                    setActionError("");
                                }}
                                placeholder="Write a comment..."
                                maxLength={1000}
                                rows={2}
                                disabled={
                                    isAddingComment
                                }
                            />

                            <button
                                type="submit"
                                disabled={
                                    isAddingComment ||
                                    !commentContent.trim()
                                }
                            >
                                {isAddingComment
                                    ? "Posting..."
                                    : "Comment"}
                            </button>
                        </form>
                    )}
                </section>
            )}

            {actionError && (
                <p className="skillora-post-action-error">
                    {actionError}
                </p>
            )}
        </article>
    );
}
