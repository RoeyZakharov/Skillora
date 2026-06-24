import {
    createUserWithEmailAndPassword,
    deleteUser as deleteFirebaseUser,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
} from "firebase/auth";

import {
    auth,
} from "../config/firebase";

import ajaxRequest from "./ajaxService";

const firebaseErrorMessages = {
    "auth/email-already-in-use":
        "An account already exists with this email address.",

    "auth/invalid-email":
        "The email address is invalid.",

    "auth/invalid-credential":
        "The email address or password is incorrect.",

    "auth/weak-password":
        "The password is too weak.",

    "auth/too-many-requests":
        "Too many attempts were made. Please try again later.",
};

const normalizeAuthenticationError = (
    error
) => {
    if (
        error?.code &&
        firebaseErrorMessages[error.code]
    ) {
        return new Error(
            firebaseErrorMessages[
                error.code
            ]
        );
    }

    if (error instanceof Error) {
        return error;
    }

    return new Error(
        "Authentication failed"
    );
};

const getAuthorizationHeaders = async (
    firebaseUser = null,
    forceRefresh = false
) => {
    // Wait until Firebase restores the saved authentication
    // state after a browser refresh.
    await auth.authStateReady();

    const authenticatedUser =
        firebaseUser || auth.currentUser;

    if (!authenticatedUser) {
        throw new Error(
            "The user is not authenticated"
        );
    }

    const idToken =
        await authenticatedUser.getIdToken(
            forceRefresh
        );

    return {
        Authorization: `Bearer ${idToken}`,
    };
};

export const registerUser = async ({
    email,
    password,
    username,
    displayName,
}) => {
    let userCredential = null;

    try {
        userCredential =
            await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );

        await updateProfile(
            userCredential.user,
            {
                displayName,
            }
        );

        const headers =
            await getAuthorizationHeaders(
                userCredential.user
            );

        const response =
            await ajaxRequest({
                endpoint:
                    "/api/users/register",
                method: "POST",
                data: {
                    username,
                    displayName,
                },
                headers,
            });

        return response.data.user;
    } catch (error) {
        /*
         * If Firebase created the account but
         * MongoDB profile creation failed,
         * remove the new Firebase account.
         */
        if (userCredential?.user) {
            try {
                await deleteFirebaseUser(
                    userCredential.user
                );
            } catch (
                rollbackError
            ) {
                console.error(
                    "Firebase registration rollback failed:",
                    rollbackError
                );
            }
        }

        throw normalizeAuthenticationError(
            error
        );
    }
};

export const loginUser = async (
    email,
    password
) => {
    try {
        await signInWithEmailAndPassword(
            auth,
            email,
            password
        );

        return await getCurrentUserProfile();
    } catch (error) {
        await signOut(auth);

        throw normalizeAuthenticationError(
            error
        );
    }
};

export const logoutUser = async () => {
    await signOut(auth);
};

export const getCurrentUserProfile =
    async () => {
        const headers =
            await getAuthorizationHeaders();

        const response =
            await ajaxRequest({
                endpoint: "/api/users/me",
                method: "GET",
                headers,
            });

        return response.data.user;
    };

export const getUserByUsername =
    async (username) => {
        const headers =
            await getAuthorizationHeaders();

        const response =
            await ajaxRequest({
                endpoint:
                    `/api/users/${encodeURIComponent(
                        username
                    )}`,
                method: "GET",
                headers,
            });

        return response.data.user;
    };

export const listUsers = async () => {
    const headers =
        await getAuthorizationHeaders();

    const response =
        await ajaxRequest({
            endpoint: "/api/users",
            method: "GET",
            headers,
        });

    return response.data.users;
};

export const searchUsers = async (
    filters
) => {
    const headers =
        await getAuthorizationHeaders();

    const response =
        await ajaxRequest({
            endpoint:
                "/api/users/search",
            method: "GET",
            data: filters,
            headers,
        });

    return response.data.users;
};

export const updateCurrentUserProfile =
    async (profileChanges) => {
        const headers =
            await getAuthorizationHeaders();

        const response =
            await ajaxRequest({
                endpoint: "/api/users/me",
                method: "PATCH",
                data: profileChanges,
                headers,
            });

        return response.data.user;
    };

export const deleteCurrentUserAccount =
    async () => {
        const headers =
            await getAuthorizationHeaders();

        const response =
            await ajaxRequest({
                endpoint: "/api/users/me",
                method: "DELETE",
                headers,
            });

        await signOut(auth);

        return response;
    };

export const observeAuthenticationState = (
    callback
) => {
    return onAuthStateChanged(
        auth,
        callback
    );
};