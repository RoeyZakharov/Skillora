"use client";

import Link from "next/link";

import {
    useEffect,
    useState,
} from "react";

import ProtectedPage, {
    useAuthenticatedUser,
} from "../components/ProtectedPage";

import {
    getMyGroupInvitations,
    requestToJoinGroup,
} from "../services/groupService";

import PostForm from "../components/PostForm";
import PostCard from "../components/PostCard";
import {
    getFeedPosts,
} from "../services/postService";

function HomeContent() {
    const { currentUser } =
        useAuthenticatedUser();

    const [
    invitations,
    setInvitations,
    ] = useState([]);

    const [
        isLoadingInvitations,
        setIsLoadingInvitations,
    ] = useState(true);

    const [
        invitationError,
        setInvitationError,
    ] = useState("");

    const [
        requestingGroupId,
        setRequestingGroupId,
    ] = useState("");

    const [
        invitationActionError,
        setInvitationActionError,
    ] = useState("");

    const [
        isPostFormOpen,
        setIsPostFormOpen,
    ] = useState(false);

    const [
        postSuccessMessage,
        setPostSuccessMessage,
    ] = useState("");

    const [posts, setPosts] =
    useState([]);

    const [
        isLoadingPosts,
        setIsLoadingPosts,
    ] = useState(true);

    const [
        postError,
        setPostError,
    ] = useState("");

    const profilePath =
        `/profile/${encodeURIComponent(
            currentUser.username
        )}`;
    
    useEffect(() => {
        let isMounted = true;

        const loadInvitations =
            async () => {
                try {
                    const result =
                        await getMyGroupInvitations();

                    if (isMounted) {
                        setInvitations(result);
                        setInvitationError("");
                    }
                } catch (error) {
                    if (isMounted) {
                        setInvitationError(
                            error.message ||
                                "Could not load invitations."
                        );
                    }
                } finally {
                    if (isMounted) {
                        setIsLoadingInvitations(
                            false
                        );
                    }
                }
            };

        loadInvitations();

    }, []);

    useEffect(() => {
        let isMounted = true;

        const loadFeedPosts = async () => {
            try {
                const feedPosts =
                    await getFeedPosts();

                if (isMounted) {
                    setPosts(feedPosts);
                    setPostError("");
                }
            } catch (error) {
                if (isMounted) {
                    setPostError(
                        error.message ||
                            "Could not load your feed."
                    );
                }
            } finally {
                if (isMounted) {
                    setIsLoadingPosts(false);
                }
            }
        };

        loadFeedPosts();

        return () => {
            isMounted = false;
        };
    }, []);

    const handleRequestToJoin = async (
        groupId
    ) => {
        setRequestingGroupId(groupId);
        setInvitationActionError("");

        try {
            await requestToJoinGroup(
                groupId
            );

            setInvitations(
                (currentInvitations) =>
                    currentInvitations.map(
                        (invitation) =>
                            invitation.groupId ===
                            groupId
                                ? {
                                    ...invitation,
                                    status: "pending",
                                    requestedAt:
                                        new Date().toISOString(),
                                }
                                : invitation
                    )
            );
        } catch (error) {
            setInvitationActionError(
                error.message ||
                    "Could not send the membership request."
            );
        } finally {
            setRequestingGroupId("");
        }
    };

    const handlePostCreated = (
        newPost
    ) => {
        setPosts((currentPosts) => [
            newPost,
            ...currentPosts,
        ]);

        setIsPostFormOpen(false);

        setPostSuccessMessage(
            "Your post was published successfully."
        );
    };

    const handlePostUpdated = (
        updatedPost
    ) => {
        setPosts((currentPosts) =>
            currentPosts.map((post) =>
                post._id === updatedPost._id
                    ? updatedPost
                    : post
            )
        );
    };

    const handlePostDeleted = (
        postId
    ) => {
        setPosts((currentPosts) =>
            currentPosts.filter(
                (post) =>
                    post._id !== postId
            )
        );
    };

    return (
        <main className="skillora-main-layout">
                <aside className="skillora-left-column">
                    <section className="skillora-profile-summary">
                        <div className="skillora-profile-cover" />

                        <div className="skillora-profile-summary-content">
                            <h2>
                                {
                                    currentUser.displayName
                                }
                            </h2>

                            <p>
                                @
                                {
                                    currentUser.username
                                }
                            </p>

                            <p>
                                {currentUser.bio ||
                                    "Share your skills and learn with the Skillora community."}
                            </p>
                        </div>

                        <nav className="skillora-side-menu">
                            <Link href="/">
                                Home
                            </Link>

                            <Link
                                href={profilePath}
                            >
                                Profile
                            </Link>

                            <Link href="/groups">
                                Groups
                            </Link>

                            <a href="#invitations">
                                Invitations
                            </a>
                        </nav>
                    </section>
                </aside>

                <section className="skillora-feed-column">
                    <section className="skillora-create-post">
                        <button
                            type="button"
                            onClick={() => {
                                setIsPostFormOpen(true);
                                setPostSuccessMessage("");
                            }}
                        >
                            Start a post
                        </button>

                        <div className="skillora-create-post-options">
                            <button
                                type="button"
                                disabled
                            >
                                Photo
                            </button>

                            <button
                                type="button"
                                disabled
                            >
                                Video
                            </button>

                            <button
                                type="button"
                                disabled
                            >
                                Skill update
                            </button>
                        </div>
                        {isPostFormOpen && (
                            <div className="skillora-post-form-container">
                                <PostForm
                                    onPostCreated={
                                        handlePostCreated
                                    }
                                    onCancel={() =>
                                        setIsPostFormOpen(false)
                                    }
                                />
                            </div>
                        )}

                        {postSuccessMessage && (
                            <p className="skillora-post-success">
                                {postSuccessMessage}
                            </p>
                        )}

                    </section>

                    {isLoadingPosts && (
                        <section className="skillora-empty-feed">
                            <p>Loading your feed...</p>
                        </section>
                    )}

                    {postError && (
                        <section className="skillora-empty-feed">
                            <p>{postError}</p>
                        </section>
                    )}

                    {!isLoadingPosts &&
                        !postError &&
                        posts.length === 0 && (
                            <section className="skillora-empty-feed">
                                <h1>
                                    Welcome to your Skillora
                                    feed
                                </h1>

                                <p>
                                    Posts from your friends
                                    and approved groups will
                                    appear here.
                                </p>

                                <Link href="/groups">
                                    Explore groups
                                </Link>
                            </section>
                        )}

                    {!isLoadingPosts &&
                        !postError &&
                        posts.map((post) => (
                            <PostCard
                                key={post._id}
                                post={post}
                                onPostUpdated={
                                    handlePostUpdated
                                }
                                onPostDeleted={
                                    handlePostDeleted
                                }
                            />
                        ))}
                </section>

                <aside className="skillora-right-column">
                    <section
                        id="invitations"
                        className="skillora-invitations-card"
                    >
                        <h2>
                            Group invitations
                            {invitations.length > 0 && (
                                <span>
                                    {" "}
                                    ({invitations.length})
                                </span>
                            )}
                        </h2>

                        {isLoadingInvitations && (
                            <p>
                                Loading invitations...
                            </p>
                        )}

                        {invitationError && (
                            <p>
                                {invitationError}
                            </p>
                        )}

                        {!isLoadingInvitations &&
                            !invitationError &&
                            invitations.length === 0 && (
                                <p>
                                    You have no new group
                                    invitations.
                                </p>
                            )}

                        {!isLoadingInvitations &&
                            invitations.map(
                                (invitation) => (
                                    <article
                                        key={
                                            invitation.groupId
                                        }
                                        className="skillora-invitation-item"
                                    >
                                        <strong>
                                            {
                                                invitation.groupName
                                            }
                                        </strong>

                                        <p>
                                            {invitation.invitedBy
                                                ?.displayName ||
                                                invitation.invitedBy
                                                    ?.username ||
                                                "A group member"}{" "}
                                            invited you.
                                        </p>

                                        <div className="skillora-invitation-actions">
                                            <Link
                                                href={`/groups/${invitation.groupId}`}
                                            >
                                                View group
                                            </Link>

                                            {invitation.status ===
                                            "invited" ? (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleRequestToJoin(
                                                            invitation.groupId
                                                        )
                                                    }
                                                    disabled={
                                                        requestingGroupId ===
                                                        invitation.groupId
                                                    }
                                                >
                                                    {requestingGroupId ===
                                                    invitation.groupId
                                                        ? "Sending..."
                                                        : "Request to join"}
                                                </button>
                                            ) : (
                                                <span className="skillora-pending-badge">
                                                    Pending approval
                                                </span>
                                            )}
                                        </div>
                                    </article>
                                )
                            )}
                            {invitationActionError && (
                                <p className="skillora-invitation-error">
                                    {invitationActionError}
                                </p>
                            )}
                    </section>

                    <section className="skillora-discover-card">
                        <h2>
                            Discover Skillora
                        </h2>

                        <p>
                            Find communities that
                            match the skills you
                            want to learn.
                        </p>

                        <Link href="/groups">
                            Explore groups
                        </Link>
                    </section>
                </aside>
            </main>
        );
}

export default function HomePage() {
    return (
        <ProtectedPage>
            <HomeContent />
        </ProtectedPage>
    );
}