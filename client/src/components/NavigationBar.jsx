"use client";

import Link from "next/link";

import {
    usePathname,
} from "next/navigation";

import {
    useEffect,
    useState,
} from "react";

import {
    getMyNotifications,
} from "../services/notificationService";

import {
    logoutUser,
} from "../services/userService";

import {
    getUnreadMessageCount,
} from "../services/messageService";

import {
    connectSocket,
} from "../services/socketService";

export default function NavigationBar({
    currentUser,
}) {
    const pathname = usePathname();

    const [
        isLoggingOut,
        setIsLoggingOut,
    ] = useState(false);

    const [
        notificationCount,
        setNotificationCount,
    ] = useState(0);

    const [
        unreadMessageCount,
        setUnreadMessageCount,
    ] = useState(0);

    const profilePath =
        `/profile/${encodeURIComponent(
            currentUser.username
        )}`;

    useEffect(() => {
        const loadNotificationCount =
            async () => {
                try {
                    const result =
                        await getMyNotifications();

                    setNotificationCount(
                        result.unreadCount
                    );
                } catch (error) {
                    console.error(
                        "Could not load notification count:",
                        error
                    );
                }
            };

        const handleNotificationsRead =
            () => {
                setNotificationCount(0);
            };

        loadNotificationCount();

        window.addEventListener(
            "skillora-notifications-read",
            handleNotificationsRead
        );

        return () => {
            window.removeEventListener(
                "skillora-notifications-read",
                handleNotificationsRead
            );
        };
    }, []);
    
    const handleLogout = async () => {
        setIsLoggingOut(true);

        try {
            await logoutUser();

            window.location.replace("/login");
        } catch (error) {
            console.error(
                "Could not sign out:",
                error
            );

            setIsLoggingOut(false);
        }
    };

    const linkClassName = (path) => {
        const isActive =
            path === "/"
                ? pathname === "/"
                : pathname.startsWith(path);

        return isActive
            ? "skillora-navigation-link skillora-navigation-link-active"
            : "skillora-navigation-link";
    };

    useEffect(() => {
        let activeSocket = null;
        let isCancelled = false;

        const refreshUnreadCount =
            async () => {
                try {
                    const count =
                        await getUnreadMessageCount();

                    if (!isCancelled) {
                        setUnreadMessageCount(
                            count
                        );
                    }
                } catch (error) {
                    console.error(
                        "Could not load unread message count:",
                        error
                    );
                }
            };

        const handleIncomingMessage = () => {
            setUnreadMessageCount(
                (currentCount) =>
                    currentCount + 1
            );
        };

        const handleMessagesRead = () => {
            refreshUnreadCount();
        };

        const startSocketListener =
            async () => {
                try {
                    const socket =
                        await connectSocket();

                    if (isCancelled) {
                        return;
                    }

                    activeSocket = socket;

                    socket.on(
                        "receive_message",
                        handleIncomingMessage
                    );
                } catch (error) {
                    console.error(
                        "Could not connect navigation chat socket:",
                        error
                    );
                }
            };

        refreshUnreadCount();
        startSocketListener();

        window.addEventListener(
            "skillora-messages-read",
            handleMessagesRead
        );

        return () => {
            isCancelled = true;

            if (activeSocket) {
                activeSocket.off(
                    "receive_message",
                    handleIncomingMessage
                );
            }

            window.removeEventListener(
                "skillora-messages-read",
                handleMessagesRead
            );
        };
    }, []);

    return (
        <header className="skillora-navigation">
            <div className="skillora-navigation-content">
                <Link
                    href="/"
                    className="skillora-logo"
                >
                    Skillora
                </Link>

                <nav className="skillora-navigation-links">
                    <Link
                        href="/"
                        className={
                            linkClassName("/")
                        }
                    >
                        Home
                    </Link>

                    <Link
                        href={profilePath}
                        className={
                            linkClassName(
                                "/profile"
                            )
                        }
                    >
                        Profile
                    </Link>

                    <Link
                        href="/groups"
                        className={
                            linkClassName(
                                "/groups"
                            )
                        }
                    >
                        Groups
                    </Link>

                    <Link
                        href="/chat"
                        className={`${linkClassName(
                            "/chat"
                        )} skillora-notifications-link`}
                    >
                        Chat

                        {unreadMessageCount > 0 && (
                            <span className="skillora-notification-badge">
                                {unreadMessageCount}
                            </span>
                        )}
                    </Link>

                    <Link
                        href="/notifications"
                        className="skillora-navigation-link skillora-notifications-link"
                    >
                        Notifications

                        {notificationCount  > 0 && (
                            <span className="skillora-notification-badge">
                                {notificationCount}
                            </span>
                        )}
                    </Link>
                </nav>

                <button
                    type="button"
                    className="skillora-logout-button"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                >
                    {isLoggingOut
                        ? "Signing out..."
                        : "Sign out"}
                </button>
            </div>
        </header>
    );
}