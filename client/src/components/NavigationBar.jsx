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