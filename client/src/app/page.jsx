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
                            disabled
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
                    </section>

                    <section className="skillora-empty-feed">
                        <h1>
                            Welcome to your
                            Skillora feed
                        </h1>

                        <p>
                            Posts from your
                            friends and approved
                            groups will appear
                            here.
                        </p>

                        <Link href="/groups">
                            Explore groups
                        </Link>
                    </section>
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