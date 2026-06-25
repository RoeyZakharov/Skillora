"use client";

import Link from "next/link";
import {
    useEffect,
    useState,
} from "react";

import ProtectedPage from "../../components/ProtectedPage";

import {
    getMyNotifications,
    markMyNotificationsAsRead,
} from "../../services/notificationService";

const formatNotificationDate = (
    createdAt
) => {
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

function NotificationsContent() {

    const [
        notifications,
        setNotifications,
    ] = useState([]);

    const [unreadCount, setUnreadCount] =
        useState(0);

    const [isLoading, setIsLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    useEffect(() => {
        const loadNotifications =
            async () => {
                try {
                    const result =
                        await getMyNotifications();

                    setNotifications(
                        result.notifications
                    );

                    setUnreadCount(
                        result.unreadCount
                    );

                    if (result.unreadCount > 0) {
                        await markMyNotificationsAsRead();

                        setUnreadCount(0);

                        setNotifications(
                            (currentNotifications) =>
                                currentNotifications.map(
                                    (notification) => ({
                                        ...notification,
                                        isRead: true,
                                    })
                                )
                        );

                        window.dispatchEvent(
                            new CustomEvent(
                                "skillora-notifications-read"
                            )
                        );
                    }
                } catch (loadError) {
                    setError(
                        loadError.message ||
                            "Could not load notifications."
                    );
                } finally {
                    setIsLoading(false);
                }
            };

        loadNotifications();
    }, []);

    return (
        <>
            <main className="skillora-notifications-page">
                <section className="skillora-notifications-panel">
                    <header className="skillora-notifications-header">
                        <div>
                            <h1>
                                Notifications
                            </h1>

                            <p>
                                Updates about your
                                posts and groups.
                            </p>
                        </div>

                        {unreadCount > 0 && (
                            <span className="skillora-notifications-count">
                                {unreadCount} unread
                            </span>
                        )}
                    </header>

                    {isLoading && (
                        <p>
                            Loading notifications...
                        </p>
                    )}

                    {error && (
                        <p className="skillora-notifications-error">
                            {error}
                        </p>
                    )}

                    {!isLoading &&
                        !error &&
                        notifications.length ===
                            0 && (
                            <div className="skillora-notifications-empty">
                                <h2>
                                    No notifications
                                    yet
                                </h2>

                                <p>
                                    New likes and group
                                    activity will appear
                                    here.
                                </p>
                            </div>
                        )}

                    {!isLoading &&
                        !error &&
                        notifications.length >
                            0 && (
                            <div className="skillora-notifications-list">
                                {notifications.map(
                                    (
                                        notification
                                    ) => {
                                        const actorName =
                                            notification
                                                .actor
                                                ?.displayName ||
                                            notification
                                                .actor
                                                ?.username ||
                                            "A Skillora user";

                                        const actorUsername =
                                            notification
                                                .actor
                                                ?.username;

                                        return (
                                            <article
                                                key={
                                                    notification._id
                                                }
                                                className={
                                                    notification.isRead
                                                        ? "skillora-notification-card"
                                                        : "skillora-notification-card skillora-notification-card-unread"
                                                }
                                            >
                                                <div className="skillora-notification-content">
                                                    <p>
                                                        {actorUsername ? (
                                                            <Link
                                                                href={`/profile/${encodeURIComponent(
                                                                    actorUsername
                                                                )}`}
                                                            >
                                                                <strong>
                                                                    {
                                                                        actorName
                                                                    }
                                                                </strong>
                                                            </Link>
                                                        ) : (
                                                            <strong>
                                                                {
                                                                    actorName
                                                                }
                                                            </strong>
                                                        )}{" "}
                                                        {notification.type === "post_liked"
                                                            ? "liked your post."
                                                            : notification.type === "post_commented"
                                                            ? "commented on your post."
                                                            : "removed your post from a group."}
                                                    </p>

                                                    {notification.postExcerpt && (
                                                        <blockquote>
                                                            {
                                                                notification.postExcerpt
                                                            }
                                                        </blockquote>
                                                    )}

                                                    <div className="skillora-notification-footer">
                                                        {notification.group && (
                                                            <Link
                                                                href={`/groups/${notification.group._id}`}
                                                            >
                                                                {
                                                                    notification
                                                                        .group
                                                                        .name
                                                                }
                                                            </Link>
                                                        )}

                                                        <time
                                                            dateTime={
                                                                notification.createdAt
                                                            }
                                                        >
                                                            {formatNotificationDate(
                                                                notification.createdAt
                                                            )}
                                                        </time>
                                                    </div>
                                                </div>
                                            </article>
                                        );
                                    }
                                )}
                            </div>
                        )}
                </section>
            </main>
        </>
    );
}

export default function NotificationsPage() {
    return (
        <ProtectedPage>
            <NotificationsContent />
        </ProtectedPage>
    );
}
