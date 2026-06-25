"use client";

import {
    useEffect,
    useState,
} from "react";

import Link from "next/link";

import {
    useParams,
    useRouter,
} from "next/navigation";

import ProtectedPage from "../../../components/ProtectedPage";
import GroupForm from "../../../components/GroupForm";
import PostCard from "../../../components/PostCard";
import PostForm from "../../../components/PostForm";

import {
    deleteGroup,
    getGroupById,
    inviteUserToGroup,
    requestToJoinGroup,
    reviewMembershipRequest,
    updateGroup,
} from "../../../services/groupService";

import {
    getGroupPosts,
} from "../../../services/postService";

import styles from "../../../styles/cards.module.css";

const formatDate = (dateValue) => {
    if (!dateValue) {
        return "Unknown";
    }

    return new Date(
        dateValue
    ).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
};

export default function GroupDetailsPage() {
    const params = useParams();
    const router = useRouter();

    const groupId =
        typeof params.groupId === "string"
            ? params.groupId
            : "";

    const [group, setGroup] =
        useState(null);

    const [isLoading, setIsLoading] =
        useState(true);

    const [
        errorMessage,
        setErrorMessage,
    ] = useState("");

    const [isJoining, setIsJoining] =
        useState(false);

    const [
        reviewingUserId,
        setReviewingUserId,
    ] = useState("");

    const [isEditing, setIsEditing] =
        useState(false);

    const [isSaving, setIsSaving] =
        useState(false);

    const [isDeleting, setIsDeleting] =
        useState(false);

    const [
        managerMessage,
        setManagerMessage,
    ] = useState("");

    const [
        managerError,
        setManagerError,
    ] = useState("");

    const [
        actionMessage,
        setActionMessage,
    ] = useState("");

    const [
        actionError,
        setActionError,
    ] = useState("");

    const [
        inviteUsername,
        setInviteUsername,
    ] = useState("");

    const [
        isInviting,
        setIsInviting,
    ] = useState(false);

    const [
        inviteMessage,
        setInviteMessage,
    ] = useState("");

    const [
        inviteError,
        setInviteError,
    ] = useState("");

    const [
        groupPosts,
        setGroupPosts,
    ] = useState([]);

    const [
        isLoadingGroupPosts,
        setIsLoadingGroupPosts,
    ] = useState(false);

    const [
        groupPostsError,
        setGroupPostsError,
    ] = useState("");

    const [
        isGroupPostFormOpen,
        setIsGroupPostFormOpen,
    ] = useState(false);

    const [
        groupPostSuccess,
        setGroupPostSuccess,
    ] = useState("");

    useEffect(() => {
        let isMounted = true;

        const loadGroup = async () => {
            if (!groupId) {
                if (isMounted) {
                    setErrorMessage(
                        "Invalid group identifier."
                    );

                    setIsLoading(false);
                }

                return;
            }

            try {
                const loadedGroup =
                    await getGroupById(
                        groupId
                    );

                if (!isMounted) {
                    return;
                }

                setGroup(loadedGroup);
                setErrorMessage("");
            } catch (error) {
                if (!isMounted) {
                    return;
                }

                setErrorMessage(
                    error.message ||
                        "Could not load the group."
                );
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        loadGroup();

        return () => {
            isMounted = false;
        };
    }, [groupId]);

    useEffect(() => {
        let isMounted = true;

        const isApprovedMember =
            group?.membership?.status ===
            "approved";

        if (!isApprovedMember) {
            setGroupPosts([]);
            setGroupPostsError("");
            setIsLoadingGroupPosts(false);

            return () => {
                isMounted = false;
            };
        }

        const loadGroupPosts =
            async () => {
                setIsLoadingGroupPosts(true);
                setGroupPostsError("");

                try {
                    const posts =
                        await getGroupPosts(
                            groupId
                        );

                    if (isMounted) {
                        setGroupPosts(posts);
                    }
                } catch (error) {
                    if (isMounted) {
                        setGroupPostsError(
                            error.message ||
                                "Could not load group posts."
                        );
                    }
                } finally {
                    if (isMounted) {
                        setIsLoadingGroupPosts(
                            false
                        );
                    }
                }
            };

        loadGroupPosts();

        return () => {
            isMounted = false;
        };
    }, [
        groupId,
        group?.membership?.status,
    ]);

    const handleJoinRequest = async () => {
        setIsJoining(true);
        setActionMessage("");
        setActionError("");

        try {
            const updatedGroup =
                await requestToJoinGroup(
                    groupId
                );

            setGroup(updatedGroup);

            setActionMessage(
                "Your membership request was sent successfully."
            );
        } catch (error) {
            setActionError(
                error.message ||
                    "Could not send the membership request."
            );
        } finally {
            setIsJoining(false);
        }
    };

    const handleMembershipDecision =
        async (userId, decision) => {
            setReviewingUserId(userId);
            setActionMessage("");
            setActionError("");

            try {
                const updatedGroup =
                    await reviewMembershipRequest(
                        groupId,
                        userId,
                        decision
                    );

                setGroup(updatedGroup);

                setActionMessage(
                    decision === "approve"
                        ? "Membership request approved."
                        : "Membership request rejected."
                );
            } catch (error) {
                setActionError(
                    error.message ||
                        "Could not update the membership request."
                );
            } finally {
                setReviewingUserId("");
            }
        };

    const handleUpdateGroup = async (
        groupData
    ) => {
        setIsSaving(true);
        setManagerMessage("");
        setManagerError("");

        try {
            const updatedGroup =
                await updateGroup(
                    groupId,
                    groupData
                );

            setGroup(updatedGroup);
            setIsEditing(false);

            setManagerMessage(
                "Group updated successfully."
            );
        } catch (error) {
            setManagerError(
                error.message ||
                    "Could not update the group."
            );
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteGroup = async () => {
        const shouldDelete =
            window.confirm(
                "Are you sure you want to permanently delete this group?"
            );

        if (!shouldDelete) {
            return;
        }

        setIsDeleting(true);
        setManagerMessage("");
        setManagerError("");

        try {
            await deleteGroup(groupId);

            router.push("/groups");
        } catch (error) {
            setManagerError(
                error.message ||
                    "Could not delete the group."
            );

            setIsDeleting(false);
        }
    };

    const handleInviteUser = async (
        event
    ) => {
        event.preventDefault();

        const normalizedUsername =
            inviteUsername.trim();

        if (!normalizedUsername) {
            setInviteError(
                "Enter a username."
            );

            return;
        }

        setIsInviting(true);
        setInviteMessage("");
        setInviteError("");

        try {
            const updatedGroup =
                await inviteUserToGroup(
                    groupId,
                    normalizedUsername
                );

            setGroup(updatedGroup);
            setInviteUsername("");

            setInviteMessage(
                `@${normalizedUsername} was invited successfully.`
            );
        } catch (error) {
            setInviteError(
                error.message ||
                    "Could not send the invitation."
            );
        } finally {
            setIsInviting(false);
        }
    };

    const approvedMembers =
        group?.members || [];

    const handleGroupPostCreated = (
        newPost
    ) => {
        setGroupPosts((currentPosts) => [
            newPost,
            ...currentPosts,
        ]);

        setIsGroupPostFormOpen(false);

        setGroupPostSuccess(
            "Your group post was published successfully."
        );
    };

    const handleGroupPostUpdated = (
        updatedPost
    ) => {
        setGroupPosts(
            (currentPosts) =>
                currentPosts.map(
                    (post) =>
                        post._id ===
                        updatedPost._id
                            ? updatedPost
                            : post
                )
        );
    };

    const handleGroupPostDeleted = (
        postId
    ) => {
        setGroupPosts(
            (currentPosts) =>
                currentPosts.filter(
                    (post) =>
                        post._id !==
                        postId
                )
        );
    };

    return (
        <ProtectedPage>
            <main
                className={
                    styles.groupDetailPage
                }
            >
                {isLoading && (
                    <div
                        className={
                            styles.stateMessage
                        }
                    >
                        Loading group...
                    </div>
                )}

                {!isLoading &&
                    errorMessage && (
                        <section
                            className={
                                styles.errorMessage
                            }
                        >
                            <h1>
                                Group unavailable
                            </h1>

                            <p>
                                {errorMessage}
                            </p>

                            <Link
                                href="/groups"
                                className={
                                    styles.backLink
                                }
                            >
                                Back to groups
                            </Link>
                        </section>
                    )}

                {!isLoading &&
                    !errorMessage &&
                    group && (
                        <article
                            className={
                                styles.groupDetailCard
                            }
                        >
                            <Link
                                href="/groups"
                                className={
                                    styles.backLink
                                }
                            >
                                ← Back to groups
                            </Link>

                            <header
                                className={
                                    styles.groupDetailHeader
                                }
                            >
                                <div>
                                    <div
                                        className={
                                            styles.groupTitleRow
                                        }
                                    >
                                        <h1>
                                            {group.name}
                                        </h1>

                                        <span
                                            className={
                                                styles.privacyBadge
                                            }
                                        >
                                            {group.privacy}
                                        </span>
                                    </div>

                                    <p
                                        className={
                                            styles.groupCategory
                                        }
                                    >
                                        {group.category}
                                    </p>
                                </div>

                                {group.canManage && (
                                    <div
                                        className={
                                            styles.groupHeaderActions
                                        }
                                    >
                                        <button
                                            type="button"
                                            className={
                                                styles.groupEditButton
                                            }
                                            onClick={() => {
                                                setIsEditing(
                                                    true
                                                );

                                                setManagerError(
                                                    ""
                                                );

                                                setManagerMessage(
                                                    ""
                                                );
                                            }}
                                            disabled={
                                                isSaving ||
                                                isDeleting
                                            }
                                        >
                                            Edit group
                                        </button>

                                        <button
                                            type="button"
                                            className={
                                                styles.groupDeleteButton
                                            }
                                            onClick={
                                                handleDeleteGroup
                                            }
                                            disabled={
                                                isSaving ||
                                                isDeleting
                                            }
                                        >
                                            {isDeleting
                                                ? "Deleting..."
                                                : "Delete group"}
                                        </button>
                                    </div>
                                )}
                            </header>

                            {managerMessage && (
                                <div
                                    className={
                                        styles.groupManagerMessage
                                    }
                                >
                                    {managerMessage}
                                </div>
                            )}

                            {managerError && (
                                <div
                                    className={
                                        styles.groupManagerError
                                    }
                                >
                                    {managerError}
                                </div>
                            )}

                            {group.canManage &&
                                isEditing && (
                                    <section
                                        className={
                                            styles.groupEditSection
                                        }
                                    >
                                        <h2>
                                            Edit group
                                        </h2>

                                        <GroupForm
                                            initialGroup={
                                                group
                                            }
                                            onSubmit={
                                                handleUpdateGroup
                                            }
                                            onCancel={() => {
                                                setIsEditing(
                                                    false
                                                );

                                                setManagerError(
                                                    ""
                                                );
                                            }}
                                            isSubmitting={
                                                isSaving
                                            }
                                            errorMessage={
                                                managerError
                                            }
                                            submitText="Save changes"
                                        />
                                    </section>
                                )}

                            <div
                                className={
                                    styles.groupWorkspace
                                }
                            >
                                <aside
                                    className={
                                        styles.groupInfoSidebar
                                    }
                                >
                                    <section
                                        className={
                                            styles.groupAbout
                                        }
                                    >
                                        <h2>
                                            About this group
                                        </h2>

                                        <p>
                                            {
                                                group.description
                                            }
                                        </p>
                                    </section>

                                    <dl
                                        className={
                                            styles.groupDetailInformation
                                        }
                                    >
                                        <div>
                                            <dt>
                                                Manager
                                            </dt>

                                            <dd>
                                                {group.admin
                                                    ?.username ? (
                                                    <Link
                                                        href={`/profile/${group.admin.username}`}
                                                    >
                                                        {
                                                            group
                                                                .admin
                                                                .displayName
                                                        }
                                                    </Link>
                                                ) : (
                                                    "Unknown"
                                                )}
                                            </dd>
                                        </div>

                                        <div>
                                            <dt>
                                                Members
                                            </dt>

                                            <dd>
                                                {
                                                    group.memberCount
                                                }
                                            </dd>
                                        </div>

                                        <div>
                                            <dt>
                                                Format
                                            </dt>

                                            <dd>
                                                {group.isOnline
                                                    ? "Online"
                                                    : "In person"}
                                            </dd>
                                        </div>

                                        <div>
                                            <dt>
                                                City
                                            </dt>

                                            <dd>
                                                {group.city ||
                                                    "Not specified"}
                                            </dd>
                                        </div>

                                        <div>
                                            <dt>
                                                Created
                                            </dt>

                                            <dd>
                                                {formatDate(
                                                    group.createdAt
                                                )}
                                            </dd>
                                        </div>
                                    </dl>

                                    {group.tags?.length >
                                        0 && (
                                        <section
                                            className={
                                                styles.groupTagsSection
                                            }
                                        >
                                            <h2>
                                                Topics
                                            </h2>

                                            <ul
                                                className={
                                                    styles.tagList
                                                }
                                            >
                                                {group.tags.map(
                                                    (
                                                        tag
                                                    ) => (
                                                        <li
                                                            key={
                                                                tag
                                                            }
                                                        >
                                                            {
                                                                tag
                                                            }
                                                        </li>
                                                    )
                                                )}
                                            </ul>
                                        </section>
                                    )}
                                </aside>

                                <section
                                    className={
                                        styles.groupFeedColumn
                                    }
                                >

                                    {group.membership?.status ===
                                        "approved" && (
                                        <section
                                            className={
                                                styles.groupCreatePostSection
                                            }
                                        >
                                            {!isGroupPostFormOpen && (
                                                <button
                                                    type="button"
                                                    className={
                                                        styles.groupStartPostButton
                                                    }
                                                    onClick={() => {
                                                        setIsGroupPostFormOpen(
                                                            true
                                                        );

                                                        setGroupPostSuccess(
                                                            ""
                                                        );
                                                    }}
                                                >
                                                    Start a group post
                                                </button>
                                            )}

                                            {isGroupPostFormOpen && (
                                                <PostForm
                                                    groupId={groupId}
                                                    onPostCreated={
                                                        handleGroupPostCreated
                                                    }
                                                    onCancel={() =>
                                                        setIsGroupPostFormOpen(
                                                            false
                                                        )
                                                    }
                                                />
                                            )}

                                            {groupPostSuccess && (
                                                <div
                                                    className={
                                                        styles.groupPostSuccess
                                                    }
                                                >
                                                    {groupPostSuccess}
                                                </div>
                                            )}
                                        </section>
                                    )}

                                    {group.membership
                                        ?.status ===
                                        "approved" && (
                                        <section
                                            className={
                                                styles.groupPostsSection
                                            }
                                        >
                                            <h2>
                                                Group posts
                                            </h2>

                                            {isLoadingGroupPosts && (
                                                <div
                                                    className={
                                                        styles.stateMessage
                                                    }
                                                >
                                                    Loading group posts...
                                                </div>
                                            )}

                                            {groupPostsError && (
                                                <div
                                                    className={
                                                        styles.actionError
                                                    }
                                                >
                                                    {
                                                        groupPostsError
                                                    }
                                                </div>
                                            )}

                                            {!isLoadingGroupPosts &&
                                                !groupPostsError &&
                                                groupPosts.length ===
                                                    0 && (
                                                    <div
                                                        className={
                                                            styles.noGroupPosts
                                                        }
                                                    >
                                                        No posts have been
                                                        published in this
                                                        group yet.
                                                    </div>
                                                )}

                                            {!isLoadingGroupPosts &&
                                                !groupPostsError &&
                                                groupPosts.length >
                                                    0 && (
                                                    <div
                                                        className={
                                                            styles.groupPostsList
                                                        }
                                                    >
                                                        {groupPosts.map(
                                                            (
                                                                post
                                                            ) => (
                                                                <PostCard
                                                                    key={post._id}
                                                                    post={post}
                                                                    onPostUpdated={
                                                                        handleGroupPostUpdated
                                                                    }
                                                                    onPostDeleted={
                                                                        handleGroupPostDeleted
                                                                    }
                                                                />
                                                            )
                                                        )}
                                                    </div>
                                                )}
                                        </section>
                                    )}

                                    {group.membership
                                        ?.status !==
                                        "approved" && (
                                        <section
                                            className={
                                                styles.groupPostsSection
                                            }
                                        >
                                            <h2>
                                                Group posts
                                            </h2>

                                            <div
                                                className={
                                                    styles.noGroupPosts
                                                }
                                            >
                                                Only approved members
                                                can view this
                                                group&apos;s posts.
                                            </div>
                                        </section>
                                    )}
                                </section>

                                <aside
                                    className={
                                        styles.groupActionSidebar
                                    }
                                >
                                    <section
                                        className={
                                            styles.membershipSection
                                        }
                                    >
                                        <h2>
                                            Membership
                                        </h2>

                                        {actionMessage && (
                                            <div
                                                className={
                                                    styles.actionSuccess
                                                }
                                            >
                                                {
                                                    actionMessage
                                                }
                                            </div>
                                        )}

                                        {actionError && (
                                            <div
                                                className={
                                                    styles.actionError
                                                }
                                            >
                                                {
                                                    actionError
                                                }
                                            </div>
                                        )}

                                        {!group.membership && (
                                            <button
                                                type="button"
                                                className={
                                                    styles.primaryButton
                                                }
                                                onClick={
                                                    handleJoinRequest
                                                }
                                                disabled={
                                                    isJoining
                                                }
                                            >
                                                {isJoining
                                                    ? "Sending request..."
                                                    : "Request to join"}
                                            </button>
                                        )}

                                        {group.membership
                                            ?.status ===
                                            "invited" && (
                                            <div>
                                                <p>
                                                    A group member
                                                    invited you to this
                                                    private group.
                                                </p>

                                                <button
                                                    type="button"
                                                    className={
                                                        styles.primaryButton
                                                    }
                                                    onClick={
                                                        handleJoinRequest
                                                    }
                                                    disabled={
                                                        isJoining
                                                    }
                                                >
                                                    {isJoining
                                                        ? "Sending request..."
                                                        : "Request to join"}
                                                </button>
                                            </div>
                                        )}

                                        {group.membership
                                            ?.status ===
                                            "pending" && (
                                            <div
                                                className={
                                                    styles.pendingMessage
                                                }
                                            >
                                                Your membership request
                                                is waiting for manager
                                                approval.
                                            </div>
                                        )}

                                        {group.membership
                                            ?.status ===
                                            "approved" && (
                                            <div
                                                className={
                                                    styles.approvedMessage
                                                }
                                            >
                                                You are a member of this
                                                group.
                                            </div>
                                        )}

                                        {group.membership
                                            ?.status ===
                                            "rejected" && (
                                            <div
                                                className={
                                                    styles.rejectedMembership
                                                }
                                            >
                                                <p>
                                                    Your previous
                                                    membership request was
                                                    rejected.
                                                </p>

                                                <button
                                                    type="button"
                                                    className={
                                                        styles.primaryButton
                                                    }
                                                    onClick={
                                                        handleJoinRequest
                                                    }
                                                    disabled={
                                                        isJoining
                                                    }
                                                >
                                                    {isJoining
                                                        ? "Sending request..."
                                                        : "Request again"}
                                                </button>
                                            </div>
                                        )}
                                    </section>

                                    {group.canInvite && (
                                        <section
                                            className={
                                                styles.groupInvitationSection
                                            }
                                        >
                                            <h2>
                                                Invite a friend
                                            </h2>

                                            <p>
                                                Invite an existing
                                                Skillora user to this
                                                private group.
                                            </p>

                                            <form
                                                className={
                                                    styles.groupInvitationForm
                                                }
                                                onSubmit={
                                                    handleInviteUser
                                                }
                                            >
                                                <input
                                                    type="text"
                                                    value={
                                                        inviteUsername
                                                    }
                                                    onChange={(
                                                        event
                                                    ) => {
                                                        setInviteUsername(
                                                            event
                                                                .target
                                                                .value
                                                        );

                                                        setInviteError(
                                                            ""
                                                        );

                                                        setInviteMessage(
                                                            ""
                                                        );
                                                    }}
                                                    placeholder="Enter username"
                                                    aria-label="Username to invite"
                                                    disabled={
                                                        isInviting
                                                    }
                                                />

                                                <button
                                                    type="submit"
                                                    disabled={
                                                        isInviting ||
                                                        !inviteUsername.trim()
                                                    }
                                                >
                                                    {isInviting
                                                        ? "Sending..."
                                                        : "Send invitation"}
                                                </button>
                                            </form>

                                            {inviteMessage && (
                                                <div
                                                    className={
                                                        styles.invitationSuccess
                                                    }
                                                >
                                                    {
                                                        inviteMessage
                                                    }
                                                </div>
                                            )}

                                            {inviteError && (
                                                <div
                                                    className={
                                                        styles.invitationError
                                                    }
                                                >
                                                    {
                                                        inviteError
                                                    }
                                                </div>
                                            )}
                                        </section>
                                    )}

                                    <section
                                        className={
                                            styles.groupMembersSection
                                        }
                                    >
                                        <h2>
                                            Group members
                                        </h2>

                                        {approvedMembers.length >
                                        0 ? (
                                            <div
                                                className={
                                                    styles.membersList
                                                }
                                            >
                                                {approvedMembers.map(
                                                    (
                                                        member
                                                    ) => (
                                                        <div
                                                            key={
                                                                member
                                                                    .user
                                                                    ._id
                                                            }
                                                            className={
                                                                styles.memberRow
                                                            }
                                                        >
                                                            <div
                                                                className={
                                                                    styles.memberIdentity
                                                                }
                                                            >
                                                                <Link
                                                                    href={`/profile/${member.user.username}`}
                                                                >
                                                                    {
                                                                        member
                                                                            .user
                                                                            .displayName
                                                                    }
                                                                </Link>

                                                                <span>
                                                                    @
                                                                    {
                                                                        member
                                                                            .user
                                                                            .username
                                                                    }
                                                                </span>
                                                            </div>

                                                            <span
                                                                className={
                                                                    styles.memberRole
                                                                }
                                                            >
                                                                {
                                                                    member.role
                                                                }
                                                            </span>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        ) : (
                                            <p
                                                className={
                                                    styles.noMembersMessage
                                                }
                                            >
                                                This group has no
                                                approved members.
                                            </p>
                                        )}
                                    </section>

                                    {group.canManage && (
                                        <section
                                            className={
                                                styles.managerRequestsSection
                                            }
                                        >
                                            <h2>
                                                Pending membership
                                                requests
                                            </h2>

                                            {group.pendingRequests
                                                ?.length >
                                            0 ? (
                                                <div
                                                    className={
                                                        styles.requestList
                                                    }
                                                >
                                                    {group.pendingRequests.map(
                                                        (
                                                            request
                                                        ) => (
                                                            <div
                                                                key={
                                                                    request
                                                                        .user
                                                                        ._id
                                                                }
                                                                className={
                                                                    styles.requestRow
                                                                }
                                                            >
                                                                <div
                                                                    className={
                                                                        styles.requestUser
                                                                    }
                                                                >
                                                                    <Link
                                                                        href={`/profile/${request.user.username}`}
                                                                    >
                                                                        {
                                                                            request
                                                                                .user
                                                                                .displayName
                                                                        }
                                                                    </Link>

                                                                    <span>
                                                                        @
                                                                        {
                                                                            request
                                                                                .user
                                                                                .username
                                                                        }
                                                                    </span>
                                                                </div>

                                                                <div
                                                                    className={
                                                                        styles.requestActions
                                                                    }
                                                                >
                                                                    <button
                                                                        type="button"
                                                                        className={
                                                                            styles.approveButton
                                                                        }
                                                                        onClick={() =>
                                                                            handleMembershipDecision(
                                                                                request
                                                                                    .user
                                                                                    ._id,
                                                                                "approve"
                                                                            )
                                                                        }
                                                                        disabled={Boolean(
                                                                            reviewingUserId
                                                                        )}
                                                                    >
                                                                        {reviewingUserId ===
                                                                        request
                                                                            .user
                                                                            ._id
                                                                            ? "Processing..."
                                                                            : "Approve"}
                                                                    </button>

                                                                    <button
                                                                        type="button"
                                                                        className={
                                                                            styles.rejectButton
                                                                        }
                                                                        onClick={() =>
                                                                            handleMembershipDecision(
                                                                                request
                                                                                    .user
                                                                                    ._id,
                                                                                "reject"
                                                                            )
                                                                        }
                                                                        disabled={Boolean(
                                                                            reviewingUserId
                                                                        )}
                                                                    >
                                                                        Reject
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            ) : (
                                                <p
                                                    className={
                                                        styles.noRequestsMessage
                                                    }
                                                >
                                                    There are no pending
                                                    membership requests.
                                                </p>
                                            )}
                                        </section>
                                    )}
                                </aside>
                            </div>
                        </article>
                    )}
            </main>
        </ProtectedPage>
    );
}
