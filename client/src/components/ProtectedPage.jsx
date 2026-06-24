"use client";

import {
    useEffect,
    useState,
} from "react";

import {
    useRouter,
} from "next/navigation";

import {
    observeAuthenticationState,
} from "../services/userService";

export default function ProtectedPage({
    children,
}) {
    const router = useRouter();

    const [isCheckingAuthentication,
        setIsCheckingAuthentication] =
        useState(true);

    const [isAuthenticated,
        setIsAuthenticated] =
        useState(false);

    useEffect(() => {
        const unsubscribe =
            observeAuthenticationState(
                (firebaseUser) => {
                    if (!firebaseUser) {
                        setIsAuthenticated(
                            false
                        );

                        setIsCheckingAuthentication(
                            false
                        );

                        router.replace(
                            "/login"
                        );

                        return;
                    }

                    setIsAuthenticated(true);
                    setIsCheckingAuthentication(
                        false
                    );
                }
            );

        return unsubscribe;
    }, [router]);

    if (isCheckingAuthentication) {
        return (
            <main className="home-page">
                <p>
                    Checking authentication...
                </p>
            </main>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return children;
}