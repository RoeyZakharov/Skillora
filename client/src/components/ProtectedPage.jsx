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

import NavigationBar from "./NavigationBar";

import {
    getMyGroupInvitations,
} from "../services/groupService";

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
        invitationCount,
        setInvitationCount,
    ] = useState(0)

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
                        setInvitationCount(0);
                        setIsCheckingAuthentication(
                            false
                        );

                        router.replace("/login");
                        return;
                    }

                    try {
                        const skilloraUser =
                            await getCurrentUserProfile();
                        
                        let invitations = [];

                        try {
                            invitations =
                                await getMyGroupInvitations();
                        } catch (error) {
                            console.error(
                                "Could not load invitation count:",
                                error
                            );
                        }

                        if (!isMounted) {
                            return;
                        }

                        setCurrentUser(
                            skilloraUser
                        );

                        setInvitationCount(
                            invitations.length
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
                invitationCount,
                setInvitationCount,
            }}
        >
            <div className="skillora-app">
                <NavigationBar
                    currentUser={currentUser}
                    invitationCount={
                        invitationCount
                    }
                />

                {children}
            </div>
        </AuthenticatedUserContext.Provider>
    );
}