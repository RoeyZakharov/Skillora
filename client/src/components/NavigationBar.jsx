"use client";

import Link from "next/link";

import {
    usePathname,
} from "next/navigation";

import {
    useState,
} from "react";

import {
    logoutUser,
} from "../services/userService";

export default function NavigationBar({
    currentUser,
    invitationCount = 0,
}) {
    const pathname = usePathname();

    const [
        isLoggingOut,
        setIsLoggingOut,
    ] = useState(false);

    const profilePath =
        `/profile/${encodeURIComponent(
            currentUser.username
        )}`;

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
                        href="/#invitations"
                        className="skillora-navigation-link"
                    >
                        Notifications

                        {invitationCount > 0 && (
                            <span className="skillora-notification-count">
                                {invitationCount}
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