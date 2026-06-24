"use client";

import {
    useEffect,
    useState,
} from "react";

import {
    useParams,
} from "next/navigation";

import ProtectedPage from "../../../components/ProtectedPage";
import UserCard from "../../../components/UserCard";

import {
    getUserByUsername,
} from "../../../services/userService";

import styles from "../../../styles/cards.module.css";

export default function ProfilePage() {
    const params = useParams();

    const username =
        typeof params.username === "string"
            ? params.username
            : "";

    const [user, setUser] =
        useState(null);

    const [isLoading, setIsLoading] =
        useState(true);

    const [errorMessage, setErrorMessage] =
        useState("");

    useEffect(() => {
        let isMounted = true;

        const loadUser = async () => {
            if (!username) {
                if (isMounted) {
                    setErrorMessage(
                        "Invalid username."
                    );

                    setIsLoading(false);
                }

                return;
            }

            try {
                const loadedUser =
                    await getUserByUsername(
                        username
                    );

                if (!isMounted) {
                    return;
                }

                setUser(loadedUser);
                setErrorMessage("");
            } catch (error) {
                if (!isMounted) {
                    return;
                }

                setErrorMessage(
                    error.message ||
                        "Could not load the user profile."
                );
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        loadUser();

        return () => {
            isMounted = false;
        };
    }, [username]);

    return (
        <ProtectedPage>
            <main className={styles.profilePage}>
                {isLoading && (
                    <div
                        className={
                            styles.stateMessage
                        }
                    >
                        Loading profile...
                    </div>
                )}

                {!isLoading &&
                    errorMessage && (
                        <div
                            className={
                                styles.errorMessage
                            }
                        >
                            <h1>
                                Profile unavailable
                            </h1>

                            <p>
                                {errorMessage}
                            </p>
                        </div>
                    )}

                {!isLoading &&
                    !errorMessage &&
                    user && (
                        <UserCard
                            user={user}
                        />
                    )}
            </main>
        </ProtectedPage>
    );
}