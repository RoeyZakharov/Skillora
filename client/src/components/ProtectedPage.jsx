"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import { useRouter } from "next/navigation";

import {
    getCurrentUserProfile,
    observeAuthenticationState,
} from "../services/userService";

const AuthenticatedUserContext =
    createContext(null);

export const useAuthenticatedUser = () => {
    const context = useContext(
        AuthenticatedUserContext
    );

    if (!context) {
        throw new Error(
            "useAuthenticatedUser must be used inside ProtectedPage"
        );
    }

    return context;
};

export default function ProtectedPage({
    children,
}) {
    const router = useRouter();

    const [
        isCheckingAuthentication,
        setIsCheckingAuthentication,
    ] = useState(true);

    const [
        currentUser,
        setCurrentUser,
    ] = useState(null);

    const [
        errorMessage,
        setErrorMessage,
    ] = useState("");

    useEffect(() => {
        let isMounted = true;

        const unsubscribe =
            observeAuthenticationState(
                async (firebaseUser) => {
                    if (!firebaseUser) {
                        if (!isMounted) {
                            return;
                        }

                        setCurrentUser(null);
                        setIsCheckingAuthentication(
                            false
                        );

                        router.replace("/login");
                        return;
                    }

                    try {
                        const skilloraUser =
                            await getCurrentUserProfile();

                        if (!isMounted) {
                            return;
                        }

                        setCurrentUser(
                            skilloraUser
                        );

                        setErrorMessage("");
                    } catch (error) {
                        if (!isMounted) {
                            return;
                        }

                        setErrorMessage(
                            error.message ||
                                "Could not load your account."
                        );
                    } finally {
                        if (isMounted) {
                            setIsCheckingAuthentication(
                                false
                            );
                        }
                    }
                }
            );

        return () => {
            isMounted = false;
            unsubscribe();
        };
    }, [router]);

    if (isCheckingAuthentication) {
        return (
            <main className="home-page">
                <p>
                    Loading your Skillora
                    account...
                </p>
            </main>
        );
    }

    if (errorMessage) {
        return (
            <main className="home-page">
                <p>{errorMessage}</p>
            </main>
        );
    }

    if (!currentUser) {
        return null;
    }

    return (
        <AuthenticatedUserContext.Provider
            value={{
                currentUser,
                setCurrentUser,
            }}
        >
            {children}
        </AuthenticatedUserContext.Provider>
    );
}